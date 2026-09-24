# C++ functionality evaluator

Build with MinGW:

```powershell
g++ -std=c++17 -Wall -Wextra -pedantic src\main.cpp -o evaluator.exe
```

The FastAPI service invokes the executable with a source path and test-case manifest. `Evaluator` is the abstract interface and `FunctionalEvaluator` inherits from it and is called polymorphically. `Submission`, `TestCase`, and `EvaluationResult` encapsulate evaluation data.

The output contains `passed_tests`, `total_tests`, `pass_rate`, `max_score: 30`, and `weighted_score`. The weighted score is `(passed_tests / total_tests) * 30`.
