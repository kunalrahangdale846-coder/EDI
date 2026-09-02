create DATABASE devcollab;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    college VARCHAR(150),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT'
);

CREATE TABLE contests (
    contest_id SERIAL PRIMARY KEY,
    contest_name VARCHAR(150) NOT NULL,
    contest_date TIMESTAMP NOT NULL,
    organizer_id INT NOT NULL,

    CONSTRAINT fk_contest_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(user_id)
);

CREATE TABLE problems (
    problem_id SERIAL PRIMARY KEY,
    contest_id INT NOT NULL,
    problem_title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(30),
    max_score INT DEFAULT 100,

    CONSTRAINT fk_problem_contest
        FOREIGN KEY (contest_id)
        REFERENCES contests(contest_id)
        ON DELETE CASCADE
);

CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,

    language VARCHAR(30) NOT NULL,
    repository_url TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submission_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_submission_contest
        FOREIGN KEY (contest_id)
        REFERENCES contests(contest_id),

    CONSTRAINT fk_submission_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(problem_id)
);


CREATE TABLE leaderboard (
    rank_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    rank_position INT NOT NULL,
    total_score DECIMAL(6,2) NOT NULL,

    CONSTRAINT fk_leaderboard_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_leaderboard_contest
        FOREIGN KEY (contest_id)
        REFERENCES contests(contest_id)
);

CREATE TABLE historicalscores (
    score_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,
    contest_id INT NOT NULL,

    total_score DECIMAL(6,2) DEFAULT 0,
    rank_position INT,

    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historical_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE userskillprofiles (
    skill_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    skill_name VARCHAR(100) NOT NULL,

    skill_level VARCHAR(30)
        CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_skill_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE performancesummary (
    summary_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,
    contest_id INT NOT NULL,

    total_submissions INT DEFAULT 0,

    average_execution_time DECIMAL(10,3),

    status VARCHAR(30)
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISQUALIFIED')),

    CONSTRAINT fk_summary_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
