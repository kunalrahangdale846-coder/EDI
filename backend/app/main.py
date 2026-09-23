import os
import shutil
import uuid
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .database import BASE_DIR, connection, engine, execute, fetch_all, fetch_one
from .evaluation import run_cpp_evaluator

load_dotenv(os.path.join(BASE_DIR, ".env"))
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads")))
WORKSPACE_DIR = Path(os.environ.get("EVALUATION_WORKSPACE", os.path.join(BASE_DIR, "evaluation_workspace")))
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
JWT_SECRET = os.environ.get("JWT_SECRET", "development-only-change-me")

app = FastAPI(title="DevCollab Pro API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({
        os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }),
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserCreate(BaseModel):
    name: str
    email: str
    college: str | None = None
    password: str
    role: str = "PARTICIPANT"


class UserLogin(BaseModel):
    email: str
    password: str


class ContestCreate(BaseModel):
    contest_name: str
    contest_date: str
    organizer_id: int | None = None


class ProblemCreate(BaseModel):
    contest_id: int
    problem_title: str
    description: str
    difficulty: str | None = None
    max_score: int = 100


class TeamCreate(BaseModel):
    team_name: str
    contest_id: int


class TeamMemberCreate(BaseModel):
    user_id: int


class HackathonCreate(BaseModel):
    name: str
    description: str = ""
    start_date: str
    end_date: str
    registration_deadline: str
    venue: str = ""
    mode: str = "ONLINE"
    rules: str = ""
    status: str = "DRAFT"

    @model_validator(mode="after")
    def validate_dates(self):
        registration = datetime.fromisoformat(self.registration_deadline)
        start = datetime.fromisoformat(self.start_date)
        end = datetime.fromisoformat(self.end_date)
        if not registration < start < end:
            raise ValueError("registration_deadline must be before start_date, which must be before end_date")
        return self


class ProblemStatementCreate(BaseModel):
    title: str
    description: str
    domain: str = ""
    requirements: str = ""
    constraints: str = ""


class RegistrationCreate(BaseModel):
    pass


class WorkflowTeamCreate(BaseModel):
    team_name: str


class ProblemSelectionCreate(BaseModel):
    problem_statement_id: int


class OrganizerEvaluationCreate(BaseModel):
    innovation_score: float | None = None
    technical_score: float | None = None
    impact_score: float | None = None
    feasibility_score: float | None = None
    presentation_score: float | None = None
    feedback: str = ""
    private_notes: str = ""


def make_token(user: dict) -> str:
    payload = {
        "user_id": user["user_id"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def public_user(user: dict) -> dict:
    return {key: user[key] for key in ("user_id", "name", "email", "college", "role")}


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "authentication required")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError as error:
        raise HTTPException(401, "invalid or expired authentication token") from error
    user = fetch_one("SELECT user_id, name, email, college, role FROM users WHERE user_id = :user_id", payload)
    if not user:
        raise HTTPException(401, "user no longer exists")
    return dict(user)


def optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization:
        return None
    return current_user(authorization)


def require_organizer(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "ORGANIZER":
        raise HTTPException(403, "organizer access required")
    return user


def get_submission_for_user(submission_id: int, user: dict) -> dict:
    submission = fetch_one(
        """SELECT s.*, c.organizer_id FROM submissions s
           JOIN contests c ON c.contest_id = s.contest_id
           WHERE s.submission_id = :submission_id""",
        {"submission_id": submission_id},
    )
    if not submission:
        raise HTTPException(404, "submission not found")
    if user["role"] == "ORGANIZER" and submission["organizer_id"] == user["user_id"]:
        return dict(submission)
    if user["role"] == "PARTICIPANT":
        member = fetch_one(
            "SELECT team_member_id FROM team_members WHERE team_id = :team_id AND user_id = :user_id",
            {"team_id": submission["team_id"], "user_id": user["user_id"]},
        ) if submission["team_id"] else None
        if member or submission["user_id"] == user["user_id"]:
            return dict(submission)
    raise HTTPException(403, "not authorized to view this submission")


def detect_submission_language(workspace: Path) -> str:
    if list(workspace.rglob("*.cpp")) or list(workspace.rglob("*.hpp")) or list(workspace.rglob("*.h")):
        return "C++"
    if list(workspace.rglob("*.py")):
        return "Python"
    if list(workspace.rglob("*.java")):
        return "Java"
    if list(workspace.rglob("*.js")) or list(workspace.rglob("*.jsx")):
        return "JavaScript"
    return "Unknown"


def evaluate_workflow_submission(submission: dict, workspace: Path) -> dict:
    language = detect_submission_language(workspace)
    if language != "C++":
        raise HTTPException(422, f"No evaluator is available for detected language: {language}")
    source_files = list(workspace.rglob("*.cpp"))
    cases = fetch_all(
        "SELECT input_data, expected_output FROM workflow_test_cases WHERE problem_statement_id = :problem_id ORDER BY id",
        {"problem_id": submission["problem_statement_id"]},
    )
    if not cases:
        raise HTTPException(400, "no workflow test cases exist for this problem")
    try:
        result = run_cpp_evaluator(str(source_files[0]), [dict(case) for case in cases])
    except RuntimeError as error:
        raise HTTPException(422, str(error)) from error
    return {"language": language, **result}


def store_workflow_evaluation(submission: dict, result: dict) -> dict:
    criterion = fetch_one("SELECT max_score FROM evaluation_criteria WHERE criterion_name = 'FUNCTIONALITY' AND active = 1")
    if not criterion:
        raise HTTPException(500, "FUNCTIONALITY criterion is not active")
    score = float(result.get("pass_rate", 0)) / 100 * float(criterion["max_score"])
    existing = fetch_one("SELECT id FROM workflow_evaluations WHERE submission_id = :submission_id ORDER BY id DESC LIMIT 1", {"submission_id": submission["id"]})
    if existing:
        execute("DELETE FROM workflow_evaluations WHERE id = :id", {"id": existing["id"]})
    created = execute(
        """INSERT INTO workflow_evaluations
           (submission_id, evaluator_id, functionality_raw, functionality_weighted, total_score, feedback)
           VALUES (:submission_id, :evaluator_id, :raw, :weighted, :total, :feedback)""",
        {"submission_id": submission["id"], "evaluator_id": submission["submitted_by"],
         "raw": result.get("pass_rate", 0), "weighted": score, "total": score,
         "feedback": f"{result.get('passed_tests', 0)} of {result.get('total_tests', 0)} functionality tests passed."},
    )
    execute("UPDATE workflow_submissions SET submission_status = 'EVALUATED' WHERE id = :id", {"id": submission["id"]})
    return {"evaluation_id": created["lastrowid"], "pass_rate": result.get("pass_rate", 0), "passed_tests": result.get("passed_tests", 0), "total_tests": result.get("total_tests", 0), "weighted_score": score, "status": "EVALUATED", "language": result.get("language")}


@app.get("/api/health")
def health():
    try:
        fetch_one("SELECT 1 AS connected")
        return {"ok": True, "database": "connected", "engine": "mysql"}
    except Exception as error:
        print(f"database health error: {error}")
        raise HTTPException(503, "MySQL is unavailable; check backend/.env and MySQL service") from error


@app.post("/api/auth/register", status_code=201)
def register(user: UserCreate):
    role = "ORGANIZER" if user.role.upper() == "ORGANIZER" else "PARTICIPANT"
    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    try:
        result = execute(
            """INSERT INTO users (name, email, college, password_hash, role)
               VALUES (:name, :email, :college, :password_hash, :role)""",
            {"name": user.name, "email": user.email.lower(), "college": user.college,
             "password_hash": password_hash, "role": role},
        )
        created = fetch_one("SELECT user_id, name, email, college, role FROM users WHERE user_id = :user_id", {"user_id": result["lastrowid"]})
        return {"user": dict(created), "token": make_token(dict(created))}
    except IntegrityError as error:
        raise HTTPException(409, "email is already registered") from error
    except SQLAlchemyError as error:
        print(f"registration database error: {error.__class__.__name__}")
        raise HTTPException(500, "registration failed because of a database error") from error


@app.post("/api/auth/login")
def login(user: UserLogin):
    stored = fetch_one("SELECT * FROM users WHERE email = :email", {"email": user.email.lower()})
    if not stored or not bcrypt.checkpw(user.password.encode(), stored["password_hash"].encode()):
        raise HTTPException(401, "invalid email or password")
    safe_user = public_user(dict(stored))
    return {"user": safe_user, "token": make_token(safe_user)}


@app.post("/api/teams", status_code=201)
def create_team(team: TeamCreate, user: dict = Depends(current_user)):
    result = execute(
        "INSERT INTO teams (team_name, contest_id) VALUES (:team_name, :contest_id)",
        {"team_name": team.team_name, "contest_id": team.contest_id},
    )
    execute("INSERT INTO team_members (team_id, user_id) VALUES (:team_id, :user_id)", {"team_id": result["lastrowid"], "user_id": user["user_id"]})
    return fetch_one("SELECT * FROM teams WHERE team_id = :team_id", {"team_id": result["lastrowid"]})


@app.get("/api/teams/my")
def my_teams(user: dict = Depends(current_user)):
    return fetch_all(
        """SELECT t.* FROM teams t JOIN team_members tm ON tm.team_id = t.team_id
           WHERE tm.user_id = :user_id ORDER BY t.created_at DESC""",
        {"user_id": user["user_id"]},
    )


@app.post("/api/teams/{team_id}/members")
def add_team_member(team_id: int, member: TeamMemberCreate, user: dict = Depends(current_user)):
    authorized = fetch_one(
        """SELECT t.team_id FROM teams t JOIN team_members tm ON tm.team_id = t.team_id
           WHERE t.team_id = :team_id AND tm.user_id = :user_id""",
        {"team_id": team_id, "user_id": user["user_id"]},
    )
    if not authorized and user["role"] != "ORGANIZER":
        raise HTTPException(403, "only a team member or organizer can add members")
    try:
        execute("INSERT INTO team_members (team_id, user_id) VALUES (:team_id, :user_id)", {"team_id": team_id, "user_id": member.user_id})
        return {"ok": True}
    except IntegrityError as error:
        raise HTTPException(409, "user is already a team member") from error


@app.post("/api/users", status_code=201)
def create_user_compat(user: UserCreate):
    return register(user)


@app.post("/api/contests", status_code=201)
def create_contest(contest: ContestCreate, user: dict = Depends(require_organizer)):
    result = execute(
        "INSERT INTO contests (contest_name, contest_date, organizer_id) VALUES (:name, :date, :organizer_id)",
        {"name": contest.contest_name, "date": contest.contest_date, "organizer_id": user["user_id"]},
    )
    return fetch_one("SELECT * FROM contests WHERE contest_id = :contest_id", {"contest_id": result["lastrowid"]})


@app.get("/api/contests")
def get_contests():
    return fetch_all("SELECT * FROM contests ORDER BY contest_date")


@app.post("/api/problems", status_code=201)
def create_problem(problem: ProblemCreate, user: dict = Depends(require_organizer)):
    contest = fetch_one("SELECT contest_id FROM contests WHERE contest_id = :contest_id AND organizer_id = :user_id", {"contest_id": problem.contest_id, "user_id": user["user_id"]})
    if not contest:
        raise HTTPException(403, "you do not organize this contest")
    result = execute(
        """INSERT INTO problems (contest_id, problem_title, description, difficulty, max_score)
           VALUES (:contest_id, :title, :description, :difficulty, :max_score)""",
        {"contest_id": problem.contest_id, "title": problem.problem_title, "description": problem.description, "difficulty": problem.difficulty, "max_score": problem.max_score},
    )
    return fetch_one("SELECT * FROM problems WHERE problem_id = :problem_id", {"problem_id": result["lastrowid"]})


@app.get("/api/contests/{contest_id}/problems")
def get_problems(contest_id: int):
    return fetch_all("SELECT * FROM problems WHERE contest_id = :contest_id", {"contest_id": contest_id})


@app.post("/api/submissions", status_code=201)
async def upload_submission(
    contest_id: int = Form(...),
    problem_id: int = Form(...),
    team_id: int = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(current_user),
):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "only ZIP project files are accepted")
    membership = fetch_one("SELECT team_id FROM team_members WHERE team_id = :team_id AND user_id = :user_id", {"team_id": team_id, "user_id": user["user_id"]})
    if not membership:
        raise HTTPException(403, "you must belong to this team")
    submission_id = uuid.uuid4().hex
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = UPLOAD_DIR / f"{submission_id}.zip"
    size = 0
    with target.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                target.unlink(missing_ok=True)
                raise HTTPException(413, "ZIP file must be 50 MB or smaller")
            output.write(chunk)
    try:
        with zipfile.ZipFile(target) as archive:
            if not archive.namelist():
                raise HTTPException(400, "ZIP file is empty")
            for name in archive.namelist():
                if Path(name).is_absolute() or ".." in Path(name).parts:
                    raise HTTPException(400, "ZIP contains an unsafe path")
    except zipfile.BadZipFile as error:
        target.unlink(missing_ok=True)
        raise HTTPException(400, "invalid ZIP file") from error
    result = execute(
        """INSERT INTO submissions (user_id, team_id, contest_id, problem_id, language, file_path, status)
           VALUES (:user_id, :team_id, :contest_id, :problem_id, 'PROJECT_ZIP', :file_path, 'SUBMITTED')""",
        {"user_id": user["user_id"], "team_id": team_id, "contest_id": contest_id, "problem_id": problem_id, "file_path": str(target)},
    )
    return fetch_one("SELECT * FROM submissions WHERE submission_id = :submission_id", {"submission_id": result["lastrowid"]})


@app.get("/api/submissions/my")
def my_submissions(user: dict = Depends(current_user)):
    return fetch_all(
        """SELECT DISTINCT s.* FROM submissions s LEFT JOIN team_members tm ON tm.team_id = s.team_id
           WHERE s.user_id = :user_id OR tm.user_id = :user_id ORDER BY s.submitted_at DESC""",
        {"user_id": user["user_id"]},
    )


@app.get("/api/submissions/{submission_id}")
def get_submission(submission_id: int, user: dict = Depends(current_user)):
    return get_submission_for_user(submission_id, user)


@app.post("/api/submissions/{submission_id}/evaluate")
def evaluate_submission(submission_id: int, user: dict = Depends(current_user)):
    submission = get_submission_for_user(submission_id, user)
    if not submission["file_path"]:
        raise HTTPException(400, "submission ZIP is missing")
    workspace = WORKSPACE_DIR / str(submission_id)
    workspace.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(submission["file_path"]) as archive:
            archive.extractall(workspace)
    except zipfile.BadZipFile as error:
        raise HTTPException(400, "invalid submission ZIP") from error
    source_files = list(workspace.rglob("*.cpp"))
    if not source_files:
        raise HTTPException(422, "prototype evaluator requires at least one .cpp file in the project ZIP")
    cases = fetch_all("SELECT input_data, expected_output FROM test_cases WHERE problem_id = :problem_id ORDER BY test_case_id", {"problem_id": submission["problem_id"]})
    if not cases:
        raise HTTPException(400, "no functionality test cases exist for this problem")
    try:
        result = run_cpp_evaluator(str(source_files[0]), [dict(case) for case in cases])
    except RuntimeError as error:
        raise HTTPException(422, str(error)) from error
    criterion = fetch_one("SELECT criterion_id, weight, max_score FROM evaluation_criteria WHERE criterion_name = 'FUNCTIONALITY' AND active = 1")
    if not criterion:
        raise HTTPException(500, "FUNCTIONALITY criterion is not active")
    evaluation = execute(
        """INSERT INTO submission_evaluations (submission_id, criterion_id, status, started_at, completed_at)
           VALUES (:submission_id, :criterion_id, 'COMPLETED', NOW(), NOW())
           ON DUPLICATE KEY UPDATE status = 'COMPLETED', completed_at = NOW()""",
        {"submission_id": submission_id, "criterion_id": criterion["criterion_id"]},
    )
    evaluation_row = fetch_one("SELECT evaluation_id FROM submission_evaluations WHERE submission_id = :submission_id AND criterion_id = :criterion_id", {"submission_id": submission_id, "criterion_id": criterion["criterion_id"]})
    pass_rate = result["pass_rate"]
    weighted_score = pass_rate / 100 * float(criterion["max_score"])
    execute(
        """INSERT INTO evaluation_results (evaluation_id, passed_tests, total_tests, pass_rate, max_score, weighted_score, feedback)
           VALUES (:evaluation_id, :passed, :total, :pass_rate, :max_score, :weighted, :feedback)
           ON DUPLICATE KEY UPDATE passed_tests = VALUES(passed_tests), total_tests = VALUES(total_tests),
           pass_rate = VALUES(pass_rate), weighted_score = VALUES(weighted_score), feedback = VALUES(feedback)""",
        {"evaluation_id": evaluation_row["evaluation_id"], "passed": result["passed_tests"], "total": result["total_tests"], "pass_rate": pass_rate, "max_score": criterion["max_score"], "weighted": weighted_score, "feedback": f"{result['passed_tests']} of {result['total_tests']} functionality tests passed."},
    )
    execute("UPDATE submissions SET status = 'EVALUATED' WHERE submission_id = :submission_id", {"submission_id": submission_id})
    return get_evaluation(submission_id, user)


@app.get("/api/submissions/{submission_id}/evaluation")
def get_evaluation(submission_id: int, user: dict = Depends(current_user)):
    submission = get_submission_for_user(submission_id, user)
    return fetch_one(
        """SELECT er.*, se.submission_id, ec.criterion_name FROM evaluation_results er
           JOIN submission_evaluations se ON se.evaluation_id = er.evaluation_id
           JOIN evaluation_criteria ec ON ec.criterion_id = se.criterion_id
           WHERE se.submission_id = :submission_id""",
        {"submission_id": submission["submission_id"]},
    ) or (_ for _ in ()).throw(HTTPException(404, "evaluation not found"))


@app.get("/api/student/evaluations")
def student_evaluations(user: dict = Depends(current_user)):
    if user["role"] != "PARTICIPANT":
        raise HTTPException(403, "participant access required")
    return fetch_all(
        """SELECT er.*, s.submission_id, s.team_id, ec.criterion_name FROM evaluation_results er
           JOIN submission_evaluations se ON se.evaluation_id = er.evaluation_id
           JOIN evaluation_criteria ec ON ec.criterion_id = se.criterion_id
           JOIN submissions s ON s.submission_id = se.submission_id
           JOIN team_members tm ON tm.team_id = s.team_id
           WHERE tm.user_id = :user_id""",
        {"user_id": user["user_id"]},
    )


@app.get("/api/organizer/submissions")
def organizer_submissions(user: dict = Depends(require_organizer)):
    return fetch_all("SELECT s.*, t.team_name FROM submissions s JOIN teams t ON t.team_id = s.team_id JOIN contests c ON c.contest_id = s.contest_id WHERE c.organizer_id = :user_id", {"user_id": user["user_id"]})


@app.get("/api/organizer/evaluations")
def organizer_evaluations(user: dict = Depends(require_organizer)):
    return fetch_all(
        """SELECT er.*, s.submission_id, t.team_name, ec.criterion_name FROM evaluation_results er
           JOIN submission_evaluations se ON se.evaluation_id = er.evaluation_id
           JOIN evaluation_criteria ec ON ec.criterion_id = se.criterion_id
           JOIN submissions s ON s.submission_id = se.submission_id
           JOIN teams t ON t.team_id = s.team_id JOIN contests c ON c.contest_id = s.contest_id
           WHERE c.organizer_id = :user_id ORDER BY er.created_at DESC""",
        {"user_id": user["user_id"]},
    )


@app.get("/api/organizer/workflow-evaluations")
def organizer_workflow_evaluations(user: dict = Depends(require_organizer)):
    return fetch_all(
        """SELECT ws.id, ws.submission_id, ws.submission_status, ws.file_name,
           wt.team_id, wt.team_name, ps.problem_id, ps.title AS problem_title,
           we.total_score, we.functionality_raw, we.functionality_weighted,
           we.feedback, we.private_notes, we.evaluator_id, we.evaluated_at
           FROM workflow_submissions ws JOIN hackathons h ON h.id = ws.hackathon_id
           JOIN workflow_teams wt ON wt.id = ws.team_id
           JOIN problem_statements ps ON ps.id = ws.problem_statement_id
           LEFT JOIN workflow_evaluations we ON we.submission_id = ws.id
           WHERE h.organizer_id = :organizer_id ORDER BY ws.submitted_at DESC""",
        {"organizer_id": user["user_id"]},
    )


@app.get("/api/organizer/contests/{contest_id}/evaluations")
def organizer_contest_evaluations(contest_id: int, user: dict = Depends(require_organizer)):
    owned = fetch_one("SELECT contest_id FROM contests WHERE contest_id = :contest_id AND organizer_id = :user_id", {"contest_id": contest_id, "user_id": user["user_id"]})
    if not owned:
        raise HTTPException(403, "you do not organize this contest")
    return fetch_all(
        """SELECT t.team_name, s.submission_id, er.passed_tests, er.total_tests,
           er.pass_rate, er.weighted_score, er.feedback
           FROM evaluation_results er
           JOIN submission_evaluations se ON se.evaluation_id = er.evaluation_id
           JOIN submissions s ON s.submission_id = se.submission_id
           JOIN teams t ON t.team_id = s.team_id
           WHERE s.contest_id = :contest_id ORDER BY er.weighted_score DESC""",
        {"contest_id": contest_id},
    )


@app.get("/api/contests/{contest_id}/leaderboard")
def contest_leaderboard(contest_id: int, user: dict = Depends(current_user)):
    if user["role"] == "ORGANIZER":
        owned = fetch_one("SELECT contest_id FROM contests WHERE contest_id = :contest_id AND organizer_id = :user_id", {"contest_id": contest_id, "user_id": user["user_id"]})
        if not owned:
            raise HTTPException(403, "you do not organize this contest")
    return fetch_all(
        """SELECT t.team_name, MAX(er.weighted_score) AS score
           FROM evaluation_results er JOIN submission_evaluations se ON se.evaluation_id = er.evaluation_id
           JOIN submissions s ON s.submission_id = se.submission_id JOIN teams t ON t.team_id = s.team_id
           WHERE s.contest_id = :contest_id GROUP BY t.team_id, t.team_name
           ORDER BY score DESC""",
        {"contest_id": contest_id},
    )


# Database-driven hackathon workflow. These endpoints use the workflow_* tables
# so the existing contest/submission prototype remains backward compatible.
@app.post("/api/hackathons", status_code=201)
def create_hackathon(hackathon: HackathonCreate, user: dict = Depends(require_organizer)):
    next_number = fetch_one("SELECT COUNT(*) + 1 AS next_number FROM hackathons")['next_number']
    year = datetime.now().year
    contest_id = f"DC{str(year)[-2:]}-{int(next_number):03d}"
    result = execute(
        """INSERT INTO hackathons
           (contest_id, name, description, start_date, end_date, registration_deadline,
            venue, mode, rules, status, organizer_id)
           VALUES (:contest_id, :name, :description, :start_date, :end_date,
            :registration_deadline, :venue, :mode, :rules, :status, :organizer_id)""",
        {"contest_id": contest_id, "name": hackathon.name, "description": hackathon.description,
         "start_date": hackathon.start_date, "end_date": hackathon.end_date,
         "registration_deadline": hackathon.registration_deadline, "venue": hackathon.venue,
         "mode": hackathon.mode, "rules": hackathon.rules,
         "status": hackathon.status.upper(), "organizer_id": user["user_id"]},
    )
    return fetch_one("SELECT * FROM hackathons WHERE id = :id", {"id": result["lastrowid"]})


@app.get("/api/hackathons")
def list_hackathons(user: dict | None = Depends(optional_user)):
    where = "" if user and user["role"] == "ORGANIZER" else "WHERE h.status = 'PUBLISHED'"
    return fetch_all(
        f"""SELECT h.*, u.name AS organizer_name FROM hackathons h
            JOIN users u ON u.user_id = h.organizer_id {where} ORDER BY h.start_date""",
    )


@app.get("/api/hackathons/{hackathon_id}")
def get_hackathon(hackathon_id: int, user: dict | None = Depends(optional_user)):
    hackathon = fetch_one("SELECT * FROM hackathons WHERE id = :id", {"id": hackathon_id})
    if not hackathon:
        raise HTTPException(404, "hackathon not found")
    if (not user or user["role"] != "ORGANIZER") and hackathon["status"] != "PUBLISHED":
        raise HTTPException(404, "hackathon not found")
    return hackathon


@app.post("/api/hackathons/{hackathon_id}/publish")
def publish_hackathon(hackathon_id: int, user: dict = Depends(require_organizer)):
    owned = fetch_one("SELECT id FROM hackathons WHERE id = :id AND organizer_id = :organizer_id", {"id": hackathon_id, "organizer_id": user["user_id"]})
    if not owned:
        raise HTTPException(404, "hackathon not found")
    execute("UPDATE hackathons SET status = 'PUBLISHED' WHERE id = :id", {"id": hackathon_id})
    return {"status": "PUBLISHED"}


@app.post("/api/hackathons/{hackathon_id}/problems", status_code=201)
def create_problem_statement(hackathon_id: int, problem: ProblemStatementCreate, user: dict = Depends(require_organizer)):
    owned = fetch_one("SELECT id FROM hackathons WHERE id = :id AND organizer_id = :organizer_id", {"id": hackathon_id, "organizer_id": user["user_id"]})
    if not owned:
        raise HTTPException(404, "hackathon not found")
    count = fetch_one("SELECT COUNT(*) + 1 AS next_number FROM problem_statements WHERE hackathon_id = :hackathon_id", {"hackathon_id": hackathon_id})['next_number']
    problem_id = f"PS-{hackathon_id:03d}-{int(count):03d}"
    result = execute(
        """INSERT INTO problem_statements
           (problem_id, hackathon_id, title, description, domain, requirements, constraints_text)
           VALUES (:problem_id, :hackathon_id, :title, :description, :domain, :requirements, :constraints)""",
        {"problem_id": problem_id, "hackathon_id": hackathon_id, "title": problem.title,
         "description": problem.description, "domain": problem.domain,
         "requirements": problem.requirements, "constraints": problem.constraints},
    )
    return fetch_one("SELECT * FROM problem_statements WHERE id = :id", {"id": result["lastrowid"]})


@app.get("/api/hackathons/{hackathon_id}/problem-statements")
def list_problem_statements(hackathon_id: int, user: dict | None = Depends(optional_user)):
    get_hackathon(hackathon_id, user)
    return fetch_all("SELECT * FROM problem_statements WHERE hackathon_id = :hackathon_id ORDER BY id", {"hackathon_id": hackathon_id})


@app.post("/api/hackathons/{hackathon_id}/register", status_code=201)
def register_for_hackathon(hackathon_id: int, _registration: RegistrationCreate, user: dict = Depends(current_user)):
    if user["role"] != "PARTICIPANT":
        raise HTTPException(403, "only participants can register")
    hackathon = fetch_one("SELECT id, status FROM hackathons WHERE id = :id", {"id": hackathon_id})
    if not hackathon or hackathon["status"] != "PUBLISHED":
        raise HTTPException(404, "published hackathon not found")
    try:
        result = execute("INSERT INTO hackathon_participants (hackathon_id, student_id) VALUES (:hackathon_id, :student_id)", {"hackathon_id": hackathon_id, "student_id": user["user_id"]})
    except IntegrityError as error:
        raise HTTPException(409, "you are already registered for this hackathon") from error
    return fetch_one("SELECT * FROM hackathon_participants WHERE id = :id", {"id": result["lastrowid"]})


@app.get("/api/student/hackathons")
def student_hackathons(user: dict = Depends(current_user)):
    return fetch_all(
        """SELECT h.*, hp.registration_date, hp.status AS participation_status,
           wt.id AS team_db_id, wt.team_id, wt.team_name, wtm.role AS team_role,
           ps.problem_id, ps.title AS problem_title, ws.submission_status,
           we.functionality_raw, we.functionality_weighted, we.total_score AS final_score
           FROM hackathon_participants hp JOIN hackathons h ON h.id = hp.hackathon_id
                     LEFT JOIN workflow_team_members wtm ON wtm.student_id = hp.student_id
                         AND wtm.id = (SELECT MIN(wtm2.id) FROM workflow_team_members wtm2
                                                     JOIN workflow_teams wt2 ON wt2.id = wtm2.team_id
                                                     WHERE wtm2.student_id = hp.student_id AND wt2.hackathon_id = h.id)
           LEFT JOIN workflow_teams wt ON wt.id = wtm.team_id AND wt.hackathon_id = h.id
           LEFT JOIN team_problem_selection tps ON tps.team_id = wt.id
           LEFT JOIN problem_statements ps ON ps.id = tps.problem_statement_id
           LEFT JOIN workflow_submissions ws ON ws.team_id = wt.id
           LEFT JOIN workflow_evaluations we ON we.submission_id = ws.id
           WHERE hp.student_id = :student_id ORDER BY h.start_date""",
        {"student_id": user["user_id"]},
    )


@app.get("/api/student/profile")
def student_profile(user: dict = Depends(current_user)):
    if user["role"] != "PARTICIPANT":
        raise HTTPException(403, "participant access required")
    participations = student_hackathons(user)
    return {"user": user, "participations": participations}


@app.get("/api/users/{user_id}/public-profile")
def public_profile(user_id: int):
    profile = fetch_one(
        "SELECT user_id, name, college, role FROM users WHERE user_id = :user_id",
        {"user_id": user_id},
    )
    if not profile:
        raise HTTPException(404, "profile not found")
    created = fetch_all(
        "SELECT id, contest_id, name, status FROM hackathons WHERE organizer_id = :organizer_id ORDER BY created_at DESC",
        {"organizer_id": user_id},
    )
    return {"user": dict(profile), "hackathons": created}


@app.post("/api/teams/workflow", status_code=201)
def create_workflow_team(team: WorkflowTeamCreate, hackathon_id: int, user: dict = Depends(current_user)):
    registered = fetch_one("SELECT id FROM hackathon_participants WHERE hackathon_id = :hackathon_id AND student_id = :student_id", {"hackathon_id": hackathon_id, "student_id": user["user_id"]})
    if not registered:
        raise HTTPException(403, "register for the hackathon first")
    existing = fetch_one(
        """SELECT wt.* FROM workflow_teams wt JOIN workflow_team_members wtm ON wtm.team_id = wt.id
           WHERE wt.hackathon_id = :hackathon_id AND wtm.student_id = :student_id""",
        {"hackathon_id": hackathon_id, "student_id": user["user_id"]},
    )
    if existing:
        raise HTTPException(409, "you already belong to a team for this hackathon")
    count = fetch_one("SELECT COUNT(*) + 1 AS next_number FROM workflow_teams WHERE hackathon_id = :hackathon_id", {"hackathon_id": hackathon_id})['next_number']
    team_id = f"TEAM-{hackathon_id:03d}-{int(count):03d}"
    result = execute("INSERT INTO workflow_teams (team_id, hackathon_id, team_name, created_by) VALUES (:team_id, :hackathon_id, :team_name, :created_by)", {"team_id": team_id, "hackathon_id": hackathon_id, "team_name": team.team_name, "created_by": user["user_id"]})
    execute("INSERT INTO workflow_team_members (team_id, student_id, role) VALUES (:team_id, :student_id, 'TEAM_LEADER')", {"team_id": result["lastrowid"], "student_id": user["user_id"]})
    return fetch_one("SELECT * FROM workflow_teams WHERE id = :id", {"id": result["lastrowid"]})


@app.post("/api/teams/{team_id}/problem")
def select_team_problem(team_id: int, selection: ProblemSelectionCreate, user: dict = Depends(current_user)):
    team = fetch_one("SELECT * FROM workflow_teams WHERE id = :team_id", {"team_id": team_id})
    member = fetch_one("SELECT id FROM workflow_team_members WHERE team_id = :team_id AND student_id = :student_id", {"team_id": team_id, "student_id": user["user_id"]})
    problem = fetch_one("SELECT id FROM problem_statements WHERE id = :problem_id AND hackathon_id = :hackathon_id", {"problem_id": selection.problem_statement_id, "hackathon_id": team["hackathon_id"] if team else 0})
    if not team or not member or not problem:
        raise HTTPException(403, "team membership or problem selection is invalid")
    execute("INSERT INTO team_problem_selection (team_id, hackathon_id, problem_statement_id) VALUES (:team_id, :hackathon_id, :problem_id) ON DUPLICATE KEY UPDATE problem_statement_id = VALUES(problem_statement_id), selected_at = NOW()", {"team_id": team_id, "hackathon_id": team["hackathon_id"], "problem_id": selection.problem_statement_id})
    return {"ok": True}


@app.post("/api/hackathons/{hackathon_id}/submissions", status_code=201)
async def create_workflow_submission(hackathon_id: int, file: UploadFile = File(...), user: dict = Depends(current_user)):
    hackathon = fetch_one("SELECT id, registration_deadline, end_date, status FROM hackathons WHERE id = :id", {"id": hackathon_id})
    if not hackathon or hackathon["status"] == "CLOSED":
        raise HTTPException(400, "submissions are not open for this hackathon")
    if datetime.now() > hackathon["end_date"]:
        raise HTTPException(400, "the hackathon submission period has ended")
    membership = fetch_one(
        """SELECT wt.id AS team_db_id, wt.team_id, tps.problem_statement_id
           FROM workflow_teams wt JOIN workflow_team_members wtm ON wtm.team_id = wt.id
           JOIN team_problem_selection tps ON tps.team_id = wt.id
           WHERE wt.hackathon_id = :hackathon_id AND wtm.student_id = :student_id""",
        {"hackathon_id": hackathon_id, "student_id": user["user_id"]},
    )
    if not membership:
        raise HTTPException(403, "join a team and select a problem before submitting")
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "only ZIP project files are accepted")
    submission_id = f"SUB-{hackathon_id:03d}-{uuid.uuid4().hex[:8].upper()}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = UPLOAD_DIR / f"{submission_id}.zip"
    size = 0
    with target.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                target.unlink(missing_ok=True)
                raise HTTPException(413, "ZIP file must be 50 MB or smaller")
            output.write(chunk)
    try:
        with zipfile.ZipFile(target) as archive:
            if not archive.namelist():
                raise HTTPException(400, "ZIP file is empty")
            if any(Path(name).is_absolute() or ".." in Path(name).parts for name in archive.namelist()):
                raise HTTPException(400, "ZIP contains an unsafe path")
    except zipfile.BadZipFile as error:
        target.unlink(missing_ok=True)
        raise HTTPException(400, "invalid ZIP file") from error
    result = execute(
        """INSERT INTO workflow_submissions
           (submission_id, hackathon_id, problem_statement_id, team_id, submitted_by, file_path, file_name)
           VALUES (:submission_id, :hackathon_id, :problem_id, :team_id, :submitted_by, :file_path, :file_name)""",
        {"submission_id": submission_id, "hackathon_id": hackathon_id,
         "problem_id": membership["problem_statement_id"], "team_id": membership["team_db_id"],
         "submitted_by": user["user_id"], "file_path": str(target), "file_name": file.filename},
    )
    submission = dict(fetch_one("SELECT * FROM workflow_submissions WHERE id = :id", {"id": result["lastrowid"]}))
    execute("UPDATE workflow_submissions SET submission_status = 'EVALUATING' WHERE id = :id", {"id": submission["id"]})
    workspace = WORKSPACE_DIR / str(submission["id"])
    try:
        if workspace.exists():
            shutil.rmtree(workspace)
        workspace.mkdir(parents=True, exist_ok=True)
        extracted_size = 0
        with zipfile.ZipFile(target) as archive:
            for member in archive.infolist():
                if Path(member.filename).is_absolute() or ".." in Path(member.filename).parts:
                    raise HTTPException(400, "ZIP contains an unsafe path")
                extracted_size += member.file_size
                if extracted_size > 200 * 1024 * 1024:
                    raise HTTPException(413, "extracted project is too large")
            archive.extractall(workspace)
        result = evaluate_workflow_submission(submission, workspace)
        stored = store_workflow_evaluation(submission, result)
        return {**submission, **stored}
    except HTTPException:
        execute("UPDATE workflow_submissions SET submission_status = 'EVALUATION_FAILED' WHERE id = :id", {"id": submission["id"]})
        raise
    except Exception as error:
        execute("UPDATE workflow_submissions SET submission_status = 'EVALUATION_FAILED' WHERE id = :id", {"id": submission["id"]})
        print(f"workflow evaluation failed: {error.__class__.__name__}")
        raise HTTPException(422, "evaluation failed; the submission was stored") from error
    finally:
        if workspace.exists():
            shutil.rmtree(workspace, ignore_errors=True)


@app.get("/api/student/submissions")
def student_workflow_submissions(user: dict = Depends(current_user)):
    return fetch_all(
        """SELECT ws.submission_id, ws.submission_status, ws.file_name, ws.submitted_at,
           h.name AS hackathon_name, h.contest_id, wt.team_id, wt.team_name,
           ps.problem_id, ps.title AS problem_title
           FROM workflow_submissions ws JOIN hackathons h ON h.id = ws.hackathon_id
           JOIN workflow_teams wt ON wt.id = ws.team_id JOIN problem_statements ps ON ps.id = ws.problem_statement_id
           JOIN workflow_team_members wtm ON wtm.team_id = wt.id
           WHERE wtm.student_id = :student_id ORDER BY ws.submitted_at DESC""",
        {"student_id": user["user_id"]},
    )


@app.get("/api/student/submissions/{submission_id}/evaluation")
def student_workflow_evaluation(submission_id: int, user: dict = Depends(current_user)):
    submission = fetch_one(
        """SELECT ws.*, wt.team_id FROM workflow_submissions ws
           JOIN workflow_team_members wtm ON wtm.team_id = ws.team_id
           JOIN workflow_teams wt ON wt.id = ws.team_id
           WHERE ws.id = :submission_id AND wtm.student_id = :student_id""",
        {"submission_id": submission_id, "student_id": user["user_id"]},
    )
    if not submission:
        raise HTTPException(404, "submission not found")
    evaluation = fetch_one(
        """SELECT functionality_raw, functionality_weighted, total_score, feedback,
           evaluated_at FROM workflow_evaluations WHERE submission_id = :submission_id
           ORDER BY id DESC LIMIT 1""",
        {"submission_id": submission_id},
    )
    return {"submission_id": submission["submission_id"], "status": submission["submission_status"], "evaluation": evaluation}


@app.post("/api/organizer/evaluations/{submission_id}", status_code=201)
def create_workflow_evaluation(submission_id: int, evaluation: OrganizerEvaluationCreate, user: dict = Depends(require_organizer)):
    submission = fetch_one(
        """SELECT ws.id, h.organizer_id FROM workflow_submissions ws JOIN hackathons h ON h.id = ws.hackathon_id
           WHERE ws.id = :submission_id""",
        {"submission_id": submission_id},
    )
    if not submission or submission["organizer_id"] != user["user_id"]:
        raise HTTPException(403, "you cannot evaluate this submission")
    scores = [evaluation.innovation_score, evaluation.technical_score, evaluation.impact_score, evaluation.feasibility_score, evaluation.presentation_score]
    if any(score is not None and (score < 0 or score > 20) for score in scores):
        raise HTTPException(400, "each evaluation score must be between 0 and 20")
    total = sum(score or 0 for score in scores)
    functionality = fetch_one("SELECT functionality_raw, functionality_weighted FROM workflow_evaluations WHERE submission_id = :submission_id ORDER BY id DESC LIMIT 1", {"submission_id": submission_id})
    result = execute(
        """INSERT INTO workflow_evaluations
           (submission_id, evaluator_id, innovation_score, technical_score, impact_score, feasibility_score, presentation_score, total_score, feedback, private_notes)
           VALUES (:submission_id, :evaluator_id, :innovation, :technical, :impact, :feasibility, :presentation, :total, :feedback, :private_notes)""",
        {"submission_id": submission_id, "evaluator_id": user["user_id"], "innovation": evaluation.innovation_score,
         "technical": evaluation.technical_score, "impact": evaluation.impact_score,
         "feasibility": evaluation.feasibility_score, "presentation": evaluation.presentation_score,
         "total": total, "feedback": evaluation.feedback, "private_notes": evaluation.private_notes},
    )
    execute("UPDATE workflow_submissions SET submission_status = 'EVALUATED' WHERE id = :submission_id", {"submission_id": submission_id})
    return {"evaluation_id": result["lastrowid"], "total_score": total}


@app.get("/api/organizer/hackathons/{hackathon_id}/submissions")
def organizer_workflow_submissions(hackathon_id: int, user: dict = Depends(require_organizer)):
    owned = fetch_one("SELECT id FROM hackathons WHERE id = :id AND organizer_id = :organizer_id", {"id": hackathon_id, "organizer_id": user["user_id"]})
    if not owned:
        raise HTTPException(404, "hackathon not found")
    return fetch_all(
        """SELECT ws.*, wt.team_id, wt.team_name, ps.problem_id, ps.title AS problem_title,
           u.name AS submitted_by_name, we.total_score, we.feedback, we.private_notes, we.evaluator_id
           FROM workflow_submissions ws JOIN workflow_teams wt ON wt.id = ws.team_id
           JOIN problem_statements ps ON ps.id = ws.problem_statement_id JOIN users u ON u.user_id = ws.submitted_by
           LEFT JOIN workflow_evaluations we ON we.submission_id = ws.id WHERE ws.hackathon_id = :hackathon_id
           ORDER BY ws.submitted_at DESC""",
        {"hackathon_id": hackathon_id},
    )


@app.post("/api/hackathons/{hackathon_id}/publish-leaderboard")
def publish_leaderboard(hackathon_id: int, user: dict = Depends(require_organizer)):
    owned = fetch_one("SELECT id FROM hackathons WHERE id = :id AND organizer_id = :organizer_id", {"id": hackathon_id, "organizer_id": user["user_id"]})
    if not owned:
        raise HTTPException(404, "hackathon not found")
    execute("UPDATE hackathons SET leaderboard_published = TRUE WHERE id = :id", {"id": hackathon_id})
    return {"leaderboard_published": True}


@app.get("/api/hackathons/{hackathon_id}/leaderboard")
def workflow_leaderboard(hackathon_id: int, user: dict = Depends(current_user)):
    hackathon = fetch_one("SELECT * FROM hackathons WHERE id = :id", {"id": hackathon_id})
    if not hackathon or (user["role"] == "PARTICIPANT" and not hackathon["leaderboard_published"]):
        raise HTTPException(404, "leaderboard is not published")
    return fetch_all(
        """SELECT DENSE_RANK() OVER (ORDER BY we.total_score DESC, ws.submitted_at ASC) AS rank_position,
           wt.team_id, wt.team_name, ps.problem_id, ps.title AS problem_title, we.total_score
           FROM workflow_evaluations we JOIN workflow_submissions ws ON ws.id = we.submission_id
           JOIN workflow_teams wt ON wt.id = ws.team_id JOIN problem_statements ps ON ps.id = ws.problem_statement_id
           WHERE ws.hackathon_id = :hackathon_id ORDER BY rank_position, ws.submitted_at""",
        {"hackathon_id": hackathon_id},
    )


@app.get("/api/hackathons/contest/{contest_id}/leaderboard")
def workflow_leaderboard_by_contest(contest_id: str, user: dict = Depends(current_user)):
    hackathon = fetch_one("SELECT id FROM hackathons WHERE contest_id = :contest_id", {"contest_id": contest_id})
    if not hackathon:
        raise HTTPException(404, "hackathon not found")
    return workflow_leaderboard(hackathon["id"], user)
