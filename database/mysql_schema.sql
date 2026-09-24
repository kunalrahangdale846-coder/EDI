CREATE DATABASE IF NOT EXISTS devcollab;
USE devcollab;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    college VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PARTICIPANT', 'ORGANIZER') NOT NULL DEFAULT 'PARTICIPANT'
);

CREATE TABLE IF NOT EXISTS contests (
    contest_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_name VARCHAR(150) NOT NULL,
    contest_date DATETIME NOT NULL,
    organizer_id INT NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS problems (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(30),
    max_score INT DEFAULT 100,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(150) NOT NULL,
    contest_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
    team_member_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_member (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    language VARCHAR(30) NOT NULL DEFAULT 'PROJECT_ZIP',
    repository_url TEXT,
    file_path TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id),
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
    rank_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    rank_position INT NOT NULL,
    total_score DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id)
);

CREATE TABLE IF NOT EXISTS historicalscores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    total_score DECIMAL(6,2) DEFAULT 0,
    rank_position INT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS userskillprofiles (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performancesummary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    total_submissions INT DEFAULT 0,
    average_execution_time DECIMAL(10,3),
    status ENUM('ACTIVE', 'COMPLETED', 'DISQUALIFIED'),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluation_criteria (
    criterion_id INT AUTO_INCREMENT PRIMARY KEY,
    criterion_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(6,2) NOT NULL DEFAULT 100,
    active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS test_cases (
    test_case_id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    test_name VARCHAR(150) NOT NULL,
    description TEXT,
    input_data TEXT,
    expected_output TEXT,
    weight DECIMAL(6,2) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_evaluations (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    criterion_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY unique_submission_criterion (submission_id, criterion_id),
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (criterion_id) REFERENCES evaluation_criteria(criterion_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluation_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    passed_tests INT NOT NULL DEFAULT 0,
    total_tests INT NOT NULL DEFAULT 0,
    pass_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
    max_score DECIMAL(6,2) NOT NULL DEFAULT 30,
    weighted_score DECIMAL(6,2) NOT NULL DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_evaluation_result (evaluation_id),
    FOREIGN KEY (evaluation_id) REFERENCES submission_evaluations(evaluation_id) ON DELETE CASCADE
);