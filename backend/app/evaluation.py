import json
import os
import subprocess
from pathlib import Path


def get_evaluator_path() -> Path:
    configured = os.environ.get("CPP_EVALUATOR_PATH", "../cpp-evaluator/evaluator.exe")
    evaluator = Path(configured)
    if not evaluator.is_absolute():
        # Check relative to backend/
        candidate1 = Path(__file__).resolve().parents[1] / evaluator
        if candidate1.exists():
            return candidate1.resolve()
        # Check relative to repo root
        candidate2 = Path(__file__).resolve().parents[2] / "cpp-evaluator" / "evaluator.exe"
        if candidate2.exists():
            return candidate2.resolve()
        return candidate1.resolve()
    return evaluator.resolve()


def run_cpp_evaluator(project_path: str, testcases: list = None) -> dict:
    evaluator = get_evaluator_path()
    if not evaluator.exists():
        raise RuntimeError(f"C++ evaluator executable not found at {evaluator}. Please compile cpp-evaluator/src/main.cpp.")

    project_dir = Path(project_path).resolve()
    if not project_dir.exists():
        raise RuntimeError(f"Project directory not found: {project_dir}")

    try:
        run_kwargs = {
            "capture_output": True,
            "text": True,
            "timeout": 60,
            "check": False,
            "cwd": str(project_dir),
        }
        if os.name == "nt":
            run_kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

        completed = subprocess.run(
            [str(evaluator), str(project_dir)],
            **run_kwargs
        )

        stdout = completed.stdout.strip()
        if not stdout:
            stderr = completed.stderr.strip()
            # If terminated by console interrupt, retry once with isolated process
            if completed.returncode == 3221225786 or completed.returncode == -1073741510:
                completed = subprocess.run(
                    [str(evaluator), str(project_dir)],
                    **run_kwargs
                )
                stdout = completed.stdout.strip()

            if not stdout:
                raise RuntimeError(f"C++ evaluator produced no output. Exit code: {completed.returncode}. Stderr: {stderr}")

        result = json.loads(stdout)
        if result.get("status") == "FAILED":
            raise RuntimeError(result.get("error", "Evaluation failed"))

        # Maintain backwards compatibility mappings if any caller references old keys
        if "functionality" in result:
            result["functionality_score"] = result["functionality"].get("score", 0)
            result["functional_score"] = result["functionality"].get("score", 0)
            result["pass_rate"] = result["functionality"].get("test_pass_rate", 0)
            result["passed_tests"] = result["functionality"].get("passed_tests", 0)
            result["total_tests"] = result["functionality"].get("total_tests", 0)

        if "code_quality" in result:
            result["code_quality_score"] = result["code_quality"].get("score", 0)

        return result

    except FileNotFoundError as error:
        raise RuntimeError(f"Evaluator executable not found: {evaluator}") from error
    except subprocess.TimeoutExpired as error:
        raise RuntimeError("Evaluation timed out after 45 seconds") from error
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Evaluator returned invalid JSON: {completed.stdout[:200]}") from error