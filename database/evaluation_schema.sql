-- Run this after schema.sql against the same PostgreSQL database.
-- These are the only tables added by the evaluation module.

CREATE TABLE IF NOT EXISTS evaluationcriteria (
    criterion_id SERIAL PRIMARY KEY,
    criterion_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
    max_score DECIMAL(6,2) NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS submissionevaluations (
    evaluation_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    criterion_id INT NOT NULL REFERENCES evaluationcriteria(criterion_id) ON DELETE CASCADE,
    score DECIMAL(6,2),
    execution_time DECIMAL(10,3),
    memory_usage DECIMAL(10,3),
    details TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (submission_id, criterion_id)
);

CREATE TABLE IF NOT EXISTS testcases (
    testcase_id SERIAL PRIMARY KEY,
    problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    input_data TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS evaluationresults (
    result_id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL UNIQUE REFERENCES submissions(submission_id) ON DELETE CASCADE,
    functional_score DECIMAL(6,2) NOT NULL DEFAULT 0,
    performance_score DECIMAL(6,2) NOT NULL DEFAULT 0,
    total_score DECIMAL(6,2) NOT NULL DEFAULT 0,
    evaluation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    feedback TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);