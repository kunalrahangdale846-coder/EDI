# DevCollab Pro

DevCollab Pro evaluates complete hackathon software projects. A participant uploads a ZIP repository, FastAPI stores its metadata in MySQL, and the C++ evaluator runs deterministic functionality tests.

## Current scope

Only `FUNCTIONALITY` is automated. The score uses:

```text
pass_rate = (passed_tests / total_tests) * 100
functionality_score = (pass_rate / 100) * 30
```

The database contains all nine future criteria, but only `FUNCTIONALITY` is active. Inactive criteria do not receive fake scores.

## Architecture

```text
React/Vite -> FastAPI -> MySQL
                  |
                  -> isolated ZIP workspace -> C++ OOP evaluator
```

## MySQL setup

Create `backend/.env` from `.env.example` and set your MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=devcollab
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace_with_a_long_random_value
FRONTEND_ORIGIN=http://localhost:5173
CPP_EVALUATOR_PATH=../cpp-evaluator/evaluator.exe
```

Do not commit `.env`.

Run from the project root:

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p < database\mysql_schema.sql
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p devcollab < database\mysql_seed.sql
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p devcollab < database\workflow_migration.sql
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p devcollab < database\evaluation_workflow_migration.sql
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p devcollab < database\workflow_seed.sql
```

Seed real workflow records using existing accounts. Set `SEED_STUDENT_EMAIL` and `SEED_ORGANIZER_EMAIL` in the current shell; these must match rows already in `users`.

```powershell
$env:SEED_STUDENT_EMAIL = 'your-existing-student-email@example.com'
$env:SEED_ORGANIZER_EMAIL = 'your-existing-organizer-email@example.com'
$env:SEED_EXTRA_PASSWORD = 'choose-a-temporary-password'
cd backend
python seed.py
```

Running `seed.py` again updates the same contest, problem, team, submission, and evaluation identifiers instead of creating duplicates. It creates optional extra seed team accounts only when `SEED_EXTRA_PASSWORD` is supplied.

## Run

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

C++ evaluator:

```powershell
cd cpp-evaluator
g++ -std=c++17 -Wall -Wextra -pedantic src\main.cpp -o evaluator.exe
```

## Submission and authorization

Participants register, log in, create or join a team, and upload a ZIP project. FastAPI validates the ZIP, saves it under `uploads/`, stores metadata in MySQL, extracts it under `evaluation_workspace/<submission_id>/`, and evaluates the first `.cpp` file against MySQL test cases.

JWTs identify the logged-in user. Participants can view a submission/evaluation only when they own it or belong to its team. Organizers can view submissions and evaluations for contests they organize. These checks happen in FastAPI.

## API

Authentication: `POST /api/auth/register`, `POST /api/auth/login`.

Teams: `POST /api/teams`, `GET /api/teams/my`, `POST /api/teams/{team_id}/members`.

Projects: `POST /api/submissions` as multipart ZIP upload, `GET /api/submissions/my`, `GET /api/submissions/{id}`.

Evaluation: `POST /api/submissions/{id}/evaluate`, `GET /api/submissions/{id}/evaluation`, `GET /api/student/evaluations`, `GET /api/organizer/evaluations`.

## Limitations

The prototype uses a separate evaluation workspace but does not yet enforce Docker CPU, memory, network, and process isolation. Add a locked-down container runner before accepting untrusted public uploads. Only Functionality is automated; the other eight criteria are extension points.
