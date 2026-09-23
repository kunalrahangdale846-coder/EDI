USE devcollab;

CREATE TABLE IF NOT EXISTS hackathons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    registration_deadline DATETIME NOT NULL,
    venue VARCHAR(200),
    mode VARCHAR(40),
    rules TEXT,
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    organizer_id INT NOT NULL,
    leaderboard_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS problem_statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id VARCHAR(80) NOT NULL UNIQUE,
    hackathon_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(100),
    requirements TEXT,
    constraints_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hackathon_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hackathon_id INT NOT NULL,
    student_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    UNIQUE KEY unique_hackathon_student (hackathon_id, student_id),
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(80) NOT NULL UNIQUE,
    hackathon_id INT NOT NULL,
    team_name VARCHAR(150) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS workflow_team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    role ENUM('TEAM_LEADER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_workflow_team_member (team_id, student_id),
    FOREIGN KEY (team_id) REFERENCES workflow_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_problem_selection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    hackathon_id INT NOT NULL,
    problem_statement_id INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_problem (team_id),
    FOREIGN KEY (team_id) REFERENCES workflow_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_statement_id) REFERENCES problem_statements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(80) NOT NULL UNIQUE,
    hackathon_id INT NOT NULL,
    problem_statement_id INT NOT NULL,
    team_id INT NOT NULL,
    submitted_by INT NOT NULL,
    file_path TEXT,
    file_name VARCHAR(255),
    submission_status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id),
    FOREIGN KEY (problem_statement_id) REFERENCES problem_statements(id),
    FOREIGN KEY (team_id) REFERENCES workflow_teams(id),
    FOREIGN KEY (submitted_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS workflow_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    functionality_raw DECIMAL(6,2),
    functionality_weighted DECIMAL(6,2),
    innovation_score DECIMAL(6,2),
    technical_score DECIMAL(6,2),
    impact_score DECIMAL(6,2),
    feasibility_score DECIMAL(6,2),
    presentation_score DECIMAL(6,2),
    total_score DECIMAL(6,2),
    feedback TEXT,
    private_notes TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES workflow_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(user_id)
);