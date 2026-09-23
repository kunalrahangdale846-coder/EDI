import json
import os
import subprocess
import tempfile
from pathlib import Path


def run_cpp_evaluator(source_path: str, testcases: list[dict]) -> dict:
    configured_evaluator = os.environ.get("CPP_EVALUATOR_PATH", "../cpp-evaluator/evaluator.exe")
    evaluator = Path(configured_evaluator)
    if not evaluator.is_absolute():
        evaluator = Path(__file__).resolve().parents[1] / evaluator
    evaluator = evaluator.resolve()
    with tempfile.TemporaryDirectory(prefix="devcollab-evaluation-") as directory:
        directory_path = Path(directory)
        manifest = directory_path / "manifest.tsv"
        manifest_lines = []
        for index, testcase in enumerate(testcases):
            input_file = directory_path / f"input-{index}.txt"
            expected_file = directory_path / f"expected-{index}.txt"
            input_file.write_text(testcase.get("input_data") or "", encoding="utf-8")
            expected_file.write_text(testcase.get("expected_output") or "", encoding="utf-8")
            manifest_lines.append(f"{input_file}\t{expected_file}")
        manifest.write_text("\n".join(manifest_lines), encoding="utf-8")
        try:
            completed = subprocess.run(
                [str(evaluator), str(Path(source_path).resolve()), str(manifest)],
                capture_output=True,
                text=True,
                timeout=30,
                check=True,
                cwd=directory,
            )
            result = json.loads(completed.stdout)
            result["functionality_score"] = result.get("functional_score", 0)
            return result
        except FileNotFoundError as error:
            raise RuntimeError("C++ evaluator is not built. See cpp-evaluator/README.md") from error
        except subprocess.TimeoutExpired as error:
            raise RuntimeError("Evaluation timed out") from error
        except subprocess.CalledProcessError as error:
            raise RuntimeError(error.stderr.strip() or "C++ evaluation failed") from error