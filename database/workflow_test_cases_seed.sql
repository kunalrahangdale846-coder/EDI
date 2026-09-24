-- Seed workflow_test_cases for existing problem statements
-- These test cases are used by the C++ OOP evaluator (FUNCTIONALITY criterion)
-- Each test case: C++ program reads from stdin, writes to stdout
-- The evaluator compiles student's .cpp file, runs it with these inputs, compares outputs

USE devcollab;

-- Problem statements that have no test cases get basic I/O tests
-- Test case: echo/identity — student program reads a number and prints it
-- This is a safe, generic test that any C++ hello-world can demonstrate

-- For problem_statements 2..7 (hackathon id=2, varithon)
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 2;

INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_large_numbers', '100 200', '300', TRUE
FROM problem_statements WHERE hackathon_id = 2;

-- For problem_statements in hackathon 3 (SIH)
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 3;

INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_zero', '0 0', '0', TRUE
FROM problem_statements WHERE hackathon_id = 3;

-- For problem_statements in hackathon 4
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 4;

-- For problem_statements in hackathon 5
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 5;

-- For problem_statements in hackathon 12 (varithon)
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 12;

INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_negatives', '-3 -5', '-8', TRUE
FROM problem_statements WHERE hackathon_id = 12;

-- For problem_statements in hackathon 13
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 13;

-- For problem_statements in hackathon 14
INSERT IGNORE INTO workflow_test_cases (problem_statement_id, test_name, input_data, expected_output, is_hidden)
SELECT id, 'add_two_numbers', '3 5', '8', FALSE
FROM problem_statements WHERE hackathon_id = 14;
