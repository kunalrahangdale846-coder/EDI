# DevCollab Pro

### Automated Multi-Criteria Evaluation and Ranking Platform for Hackathon Software Projects

DevCollab Pro is a full-stack web platform designed to manage hackathons and automate the evaluation of complete software-project submissions.

Unlike traditional online judges that primarily evaluate whether a program produces the expected output, DevCollab Pro is designed to evaluate an entire software project using multiple criteria such as functionality, code quality, performance, database design, documentation, innovation, security, UI/UX, and presentation.

The system combines a web-based hackathon management platform with an automated project evaluation framework.

---

## Project Objective

The main objective of DevCollab Pro is to make software-project evaluation more:

- Automated
- Consistent
- Measurable
- Reproducible
- Explainable
- Scalable

A participant submits a complete software project, normally as a ZIP file.

The platform processes the submission and evaluates measurable properties of the project before storing the results and presenting them through the dashboard.

---

# Core Workflow

```text
Student
   |
   | Submit Project / ZIP
   v
React Frontend
   |
   | HTTP Request
   v
FastAPI Backend
   |
   +---- Validate Submission
   |
   +---- Store Submission
   |
   +---- Extract Project
   |
   v
Evaluation Engine
   |
   +---- Functionality Analysis
   |
   +---- Code Quality Analysis
   |
   +---- Performance Analysis
   |
   +---- Other Evaluation Metrics
   |
   v
Score Calculation
   |
   v
MySQL Database
   |
   v
Evaluation Dashboard
   |
   v
Leaderboard / Results

Main Features
Authentication

The platform supports user registration and login.

Users can operate according to their role:

Student
Organizer

The backend is responsible for authentication, authorization and database operations.

Student Features

Students can:

Create an account
Log in
View available hackathons
View hackathon/problem information
Submit their software project
Upload a ZIP project
Track submission status
View evaluation results
View criterion-wise scores
View ranking where permitted
Organizer Features

Organizers can:

Create hackathons
Define problems
Manage participants
View submissions
Define evaluation criteria
View evaluation results
Analyze project scores
View rankings
Manage hackathon data
Project Evaluation

The central research component of DevCollab Pro is the automated evaluation of complete software projects.

The proposed evaluation framework contains nine criteria.

Criterion	Weight
Functionality	30%
Code Quality	15%
Performance	10%
Database Design	10%
Documentation	10%
Innovation	10%
Security	5%
UI/UX	5%
Presentation	5%
Total	100%

The current implementation focuses primarily on automated evaluation of:

Functionality
Code Quality

Other criteria can be extended as the evaluation engine develops.

Functionality Evaluation

Functionality measures whether the submitted software actually performs the required operations.

For example, a project may be required to implement:

User registration
Login
CRUD operations
REST APIs
Database operations

The evaluator can execute predefined tests against the submitted project.

Example:

Total Tests = 20
Passed Tests = 17

Functionality Score
= 17 / 20 × 100
= 85

The resulting score can then contribute to the overall evaluation according to the defined weight.

Code Quality Evaluation

Code quality is evaluated using measurable software-engineering metrics.

Potential measurements include:

Cyclomatic complexity
Code duplication
Static analysis findings
Maintainability indicators
Code structure
Naming/style issues
Code smells

Example:

Source Code
     |
     v
Project Scanner
     |
     v
Code Analysis
     |
     +---- Complexity
     |
     +---- Duplication
     |
     +---- Static Analysis
     |
     v
Normalized Code Quality Score

The purpose is to transform measurable source-code properties into an interpretable quality score.

Evaluation Algorithms and Methods

The project investigates multiple algorithms and analytical methods relevant to automated software-project evaluation.

Similarity and Semantic Analysis
Cosine Similarity
Text Embeddings
NLP Analysis
Novelty / Similarity Detection

These methods can support semantic comparison, project similarity and requirement matching.

Code Analysis
Cyclomatic Complexity
Code Duplication Analysis
Static Code Analysis
Test Pass Rate
Performance Metrics

These methods provide measurable evidence for software quality and functionality.

Multi-Criteria Decision Making

The project investigates:

AHP
Min-Max Normalization
Weighted Sum Model (WSM)
TOPSIS
VIKOR
Weighted Borda Count
Fuzzy TOPSIS

These methods can be used to aggregate multiple criterion scores and rank software projects.

Validation and Robustness

The research component also considers:

Kendall's Tau
Sensitivity Analysis

These methods can be used to compare rankings and study the stability of results when criterion weights change.

C++ Evaluation Engine

A C++ component is included as part of the evaluation architecture.

The C++ evaluation engine is intended to demonstrate object-oriented design and implement evaluation-related functionality.

A conceptual architecture is:

                 Analyzer
                    |
       +------------+------------+
       |            |            |
       v            v            v
Complexity     Duplication    Performance
Analyzer       Analyzer       Analyzer
       |            |            |
       +------------+------------+
                    |
                    v
             Evaluation Engine
                    |
                    v
              Score Calculator

The implementation can demonstrate:

Encapsulation
Abstraction
Inheritance
Polymorphism
Composition
Technology Stack
Frontend
React
Vite
JavaScript
HTML
CSS

The frontend provides the user interface for students and organizers.

Backend
Python
FastAPI
SQLAlchemy
PyMySQL
Uvicorn

FastAPI provides the REST API layer connecting the frontend, evaluation system and database.

Database
MySQL

The database stores application and evaluation information.

Evaluation
C++
Python
Automated testing
Static/code analysis
Software metrics
Database

The system uses MySQL for persistent storage.

The database is responsible for storing information such as:

Users
Hackathons/contests
Problems
Submissions
Teams
Evaluation criteria
Evaluation results
Test cases
Scores
Rankings

The database schema is designed to maintain relationships between users, submissions, contests and evaluations.

Submission Processing

When a student submits a ZIP file, the ZIP itself is not treated as the final score.

It becomes the input to the evaluation pipeline.

ZIP Submission
      |
      v
Validation
      |
      v
Extraction
      |
      v
Project Scanner
      |
      +---- Detect files
      +---- Detect languages
      +---- Analyze structure
      +---- Identify configuration
      |
      v
Evaluation Engine
      |
      v
Criterion Scores
      |
      v
Final Evaluation
      |
      v
Database

This approach allows DevCollab Pro to evaluate complete software projects rather than only individual programming answers.

Research Motivation

Traditional programming judges generally focus on:

Source Code
     |
Compilation
     |
Execution
     |
Test Cases
     |
Pass / Fail

DevCollab Pro investigates a broader evaluation model:

Complete Software Project
          |
          +---- Functionality
          |
          +---- Code Quality
          |
          +---- Performance
          |
          +---- Database Design
          |
          +---- Documentation
          |
          +---- Innovation
          |
          +---- Security
          |
          +---- UI/UX
          |
          +---- Presentation
          |
          v
     Overall Evaluation
          |
          v
       Ranking

The research focus is therefore project-level, multi-criteria evaluation of hackathon software projects.

Research Questions

The project can investigate questions such as:

RQ1

Can automated functional testing provide a reproducible functionality score for complete software projects?

RQ2

Can measurable source-code metrics be used to generate an automated code-quality score?

RQ3

How do different multi-criteria decision-making methods affect project rankings?

RQ4

How sensitive are project rankings to changes in evaluation weights?

RQ5

How closely do automated evaluation results agree with human/judge evaluations?

Research Gap

Existing automated programming evaluation systems are primarily designed around program correctness and predefined test cases.

DevCollab Pro investigates a broader problem:

Automated project-level evaluation of complete hackathon software submissions using multiple measurable software-quality criteria and algorithmic ranking methods.

The proposed framework combines:

Functional testing
Code analysis
Software metrics
Multi-criteria evaluation
Ranking
Database-backed evaluation management
Explainable evaluation results
Project Architecture
                    DEV COLLAB PRO
                         |
          +--------------+--------------+
          |                             |
       STUDENT                      ORGANIZER
          |                             |
          |                             |
     Submit Project                Create Hackathon
          |                        Define Problem
          |                        Manage Criteria
          |                             |
          +-------------+---------------+
                        |
                        v
                React Frontend
                        |
                        v
                 FastAPI Backend
                        |
                        v
                    MySQL
                        |
                        v
               Submission Manager
                        |
                        v
                 ZIP Extraction
                        |
                        v
                 Project Scanner
                        |
             +----------+----------+
             |                     |
             v                     v
      Functional Tests       Code Analysis
             |                     |
             v                     v
      Functionality           Code Quality
             |                     |
             +----------+----------+
                        |
                        v
                Evaluation Engine
                        |
                        v
                  Score Calculation
                        |
                        v
                     MySQL
                        |
                        v
              Result Dashboard
                        |
                        v
                  Leaderboard
Project Structure

The project is organized into major components similar to:

EDI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── evaluation.py
│   │
│   ├── src/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│
├── database/
│   ├── mysql_schema.sql
│   ├── mysql_seed.sql
│   └── evaluation_schema.sql
│
├── cpp-evaluator/
│
├── README.md
└── .gitignore

The exact structure may change as development continues.

Local Development
Prerequisites

Install:

Python 3.x
Node.js and npm
MySQL 8.x
C++ compiler
Git
Backend Setup

Open a terminal in the backend directory:

cd backend

Install Python dependencies:

pip install -r requirements.txt

Create a .env file based on .env.example.

Example:

DB_HOST=localhost
DB_PORT=3306
DB_NAME=devcollab
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=replace_with_a_secure_random_value

FRONTEND_ORIGIN=http://localhost:5173

Do not commit the real .env file to GitHub.

Start Backend

From:

backend/

run:

uvicorn app.main:app --reload --port 8000

The backend should be available at:

http://127.0.0.1:8000

Health endpoint:

http://127.0.0.1:8000/api/health
Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend normally runs at:

http://localhost:5173
Database Setup

Start the MySQL server and create the required database.

The SQL scripts are located inside:

database/

Important schema files include:

mysql_schema.sql
mysql_seed.sql
evaluation_schema.sql

The exact execution order should follow the database setup instructions for the current project version.

Environment Variables

Never commit passwords, API keys or other secrets.

The repository should contain:

.env.example

rather than the real:

.env

The .gitignore should exclude:

.env
__pycache__/
node_modules/
*.pyc

and other generated files.

Evaluation Criteria

The planned complete evaluation framework is:

Criterion	Weight
Functionality	30%
Code Quality	15%
Performance	10%
Database Design	10%
Documentation	10%
Innovation	10%
Security	5%
UI/UX	5%
Presentation	5%

Total:

100%

The implementation can progressively integrate additional evaluation modules.

Current Development Focus

The primary implementation focus is:

1. Functionality

Automated testing of required project operations.

2. Code Quality

Automated analysis using measurable software-quality metrics.

These two criteria provide the foundation for the broader evaluation framework.

Future Extensions

Possible future extensions include:

Performance evaluation
Database-design analysis
Documentation analysis
Innovation analysis
Security analysis
UI/UX analysis
Presentation evaluation
TOPSIS ranking
AHP weighting
Sensitivity analysis
Kendall's Tau ranking validation
Semantic similarity
NLP analysis
LLM-generated feedback
Machine-learning-based prediction
Containerized project execution
Scalable evaluation workers

These are research/development extensions and should only be described as implemented when they are actually implemented.

Research Contribution

The project does not claim to invent automated code evaluation or MCDM algorithms.

The intended contribution is the application and integration of these techniques into a configurable platform for hackathon software-project evaluation.

The central research proposition is:

DevCollab Pro proposes a project-level multi-criteria evaluation framework for hackathon software submissions that combines automated functional testing and software-quality analysis with algorithmic score aggregation and ranking.