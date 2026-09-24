USE devcollab;

CREATE TABLE IF NOT EXISTS workflow_test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_statement_id INT NOT NULL,
    test_name VARCHAR(150) NOT NULL,
    input_data TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_statement_id) REFERENCES problem_statements(id) ON DELETE CASCADE
);