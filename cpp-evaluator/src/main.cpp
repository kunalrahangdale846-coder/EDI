#include <algorithm>
#include <chrono>
#include <cctype>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

struct TestCase {
    std::string inputPath;
    std::string expectedPath;
};

struct EvaluationResult {
    double functionalScore = 0;
    double performanceScore = 0;
    double totalScore = 0;
    int passedTests = 0;
    int totalTests = 0;
    double executionTime = 0;
    std::string status = "FAILED";
};

class Submission {
public:
    explicit Submission(std::string sourcePath) : sourcePath_(std::move(sourcePath)) {}
    const std::string& sourcePath() const { return sourcePath_; }

private:
    std::string sourcePath_;
};

class EvaluationCriterion {
public:
    explicit EvaluationCriterion(std::string name) : name_(std::move(name)) {}
    virtual ~EvaluationCriterion() = default;
    virtual double evaluate(const Submission&, const std::vector<TestCase>&, EvaluationResult&) = 0;
    const std::string& name() const { return name_; }

private:
    std::string name_;
};

class FunctionalEvaluator final : public EvaluationCriterion {
public:
    FunctionalEvaluator() : EvaluationCriterion("FUNCTIONAL_CORRECTNESS") {}

    double evaluate(const Submission& submission, const std::vector<TestCase>& testCases,
                    EvaluationResult& result) override {
        const std::string executable = "devcollab-submission.exe";
        const std::string compileCommand = "g++ -std=c++17 -O2 \"" + submission.sourcePath() +
            "\" -o \"" + executable + "\"";
        if (std::system(compileCommand.c_str()) != 0) return 0;

        for (std::size_t index = 0; index < testCases.size(); ++index) {
            const std::string output = "devcollab-output-" + std::to_string(index) + ".txt";
            const std::string runCommand = "\"" + executable + "\" < \"" +
                testCases[index].inputPath + "\" > \"" + output + "\"";
            const auto started = std::chrono::steady_clock::now();
            const int exitCode = std::system(runCommand.c_str());
            const auto finished = std::chrono::steady_clock::now();
            result.executionTime += std::chrono::duration<double>(finished - started).count();
            if (exitCode == 0 && normalize(readFile(output)) == normalize(readFile(testCases[index].expectedPath))) {
                ++result.passedTests;
            }
            std::remove(output.c_str());
        }

        result.totalTests = static_cast<int>(testCases.size());
        return result.totalTests == 0 ? 0 : (100.0 * result.passedTests / result.totalTests);
    }

private:
    static std::string readFile(const std::string& path) {
        std::ifstream file(path);
        std::stringstream contents;
        contents << file.rdbuf();
        return contents.str();
    }

    static std::string normalize(const std::string& value) {
        std::istringstream stream(value);
        std::string token;
        std::string normalizedValue;
        while (stream >> token) {
            if (!normalizedValue.empty()) normalizedValue += ' ';
            normalizedValue += token;
        }
        return normalizedValue;
    }
};

class PerformanceEvaluator final : public EvaluationCriterion {
public:
    PerformanceEvaluator() : EvaluationCriterion("PERFORMANCE") {}

    double evaluate(const Submission&, const std::vector<TestCase>&, EvaluationResult& result) override {
        const double score = 100.0 - ((result.executionTime - 1.0) * 100.0 / 9.0);
        return std::max(0.0, std::min(100.0, score));
    }
};

class Evaluator {
public:
    void addCriterion(std::unique_ptr<EvaluationCriterion> criterion) {
        criteria_.push_back(std::move(criterion));
    }

    EvaluationResult evaluate(const Submission& submission, const std::vector<TestCase>& testCases) {
        EvaluationResult result;
        for (const auto& criterion : criteria_) {
            const double score = criterion->evaluate(submission, testCases, result);
            if (criterion->name() == "FUNCTIONAL_CORRECTNESS") result.functionalScore = score;
            if (criterion->name() == "PERFORMANCE") result.performanceScore = score;
        }
        result.totalScore = result.functionalScore * 0.30;
        result.status = result.passedTests == result.totalTests ? "COMPLETED" : "COMPLETED_WITH_FAILURES";
        return result;
    }

private:
    std::vector<std::unique_ptr<EvaluationCriterion>> criteria_;
};

std::vector<TestCase> loadTestCases(const std::string& manifestPath) {
    std::ifstream manifest(manifestPath);
    std::vector<TestCase> testCases;
    std::string line;
    while (std::getline(manifest, line)) {
        const std::size_t separator = line.find('\t');
        if (separator != std::string::npos) {
            testCases.push_back({line.substr(0, separator), line.substr(separator + 1)});
        }
    }
    return testCases;
}

int main(int argc, char** argv) {
    if (argc != 3) return 2;
    Evaluator evaluator;
    evaluator.addCriterion(std::make_unique<FunctionalEvaluator>());
    const EvaluationResult result = evaluator.evaluate(Submission(argv[1]), loadTestCases(argv[2]));
    std::cout << std::fixed << std::setprecision(3)
        << "{\"criterion\":\"FUNCTIONALITY\""
        << ",\"passed_tests\":" << result.passedTests
        << ",\"total_tests\":" << result.totalTests
        << ",\"pass_rate\":" << result.functionalScore
        << ",\"max_score\":30"
        << ",\"weighted_score\":" << result.totalScore
        << ",\"execution_time\":" << result.executionTime
        << ",\"status\":\"" << result.status << "\"}\n";
}
