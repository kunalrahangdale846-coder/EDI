"""Idempotently seed real MySQL workflow records for local development/demo preparation."""

import os
import bcrypt
from sqlalchemy import text

from app.database import engine

STUDENT_EMAIL = os.environ.get("SEED_STUDENT_EMAIL")
ORGANIZER_EMAIL = os.environ.get("SEED_ORGANIZER_EMAIL")
EXTRA_PASSWORD = os.environ.get("SEED_EXTRA_PASSWORD")

HACKATHONS = [
    ("SIH26-VIT-001", "SIH Internal Hackathon 2026", "Build practical technology for public infrastructure."),
    ("IC26-VIT-002", "Innovation Challenge 2026", "Turn an original idea into a working software project."),
    ("TFI26-VIT-003", "Tech for Impact 2026", "Create software that produces measurable social impact."),
]


def one(conn, sql, params):
    return conn.execute(text(sql), params).mappings().first()


def ensure_user(conn, email, name, role, password=None):
    existing = one(conn, "SELECT user_id, email, name, role FROM users WHERE email = :email", {"email": email})
    if existing:
        return dict(existing)
    if not password:
        raise RuntimeError(f"No existing {role} account for {email}. Set a password before seeding.")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    result = conn.execute(
        text("""INSERT INTO users (name, email, password_hash, role)
                VALUES (:name, :email, :password_hash, :role)"""),
        {"name": name, "email": email, "password_hash": password_hash, "role": role},
    )
    return dict(one(conn, "SELECT user_id, email, name, role FROM users WHERE user_id = :id", {"id": result.lastrowid}))


def upsert_hackathon(conn, organizer_id, contest_id, name, description):
    conn.execute(
        text("""INSERT INTO hackathons
          (contest_id, name, description, start_date, end_date, registration_deadline,
           venue, mode, rules, status, organizer_id, leaderboard_published)
          VALUES (:contest_id, :name, :description, '2026-10-01 09:00:00', '2026-10-03 17:00:00',
                  '2026-09-30 23:59:00', 'VIT Pune', 'HYBRID', 'Respect the code of conduct.',
                  'PUBLISHED', :organizer_id, TRUE)
          ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description),
          status = 'PUBLISHED', organizer_id = VALUES(organizer_id), leaderboard_published = TRUE"""),
        {"contest_id": contest_id, "name": name, "description": description, "organizer_id": organizer_id},
    )
    return dict(one(conn, "SELECT id, contest_id FROM hackathons WHERE contest_id = :contest_id", {"contest_id": contest_id}))


def upsert_problem(conn, hackathon_id, problem_id, title, description, domain):
    conn.execute(
        text("""INSERT INTO problem_statements
          (problem_id, hackathon_id, title, description, domain, requirements, constraints_text)
          VALUES (:problem_id, :hackathon_id, :title, :description, :domain, 'Working software project and README.', 'Submit a ZIP under 50 MB.')
          ON DUPLICATE KEY UPDATE hackathon_id = VALUES(hackathon_id), title = VALUES(title),
          description = VALUES(description), domain = VALUES(domain)"""),
        {"problem_id": problem_id, "hackathon_id": hackathon_id, "title": title, "description": description, "domain": domain},
    )
    return dict(one(conn, "SELECT id, problem_id FROM problem_statements WHERE problem_id = :problem_id", {"problem_id": problem_id}))


def upsert_team(conn, hackathon_id, team_id, team_name, student_id, role="TEAM_LEADER"):
    conn.execute(
        text("""INSERT INTO workflow_teams (team_id, hackathon_id, team_name, created_by)
          VALUES (:team_id, :hackathon_id, :team_name, :created_by)
          ON DUPLICATE KEY UPDATE hackathon_id = VALUES(hackathon_id), team_name = VALUES(team_name)"""),
        {"team_id": team_id, "hackathon_id": hackathon_id, "team_name": team_name, "created_by": student_id},
    )
    team = dict(one(conn, "SELECT id, team_id FROM workflow_teams WHERE team_id = :team_id", {"team_id": team_id}))
    conn.execute(
        text("""INSERT INTO workflow_team_members (team_id, student_id, role)
          VALUES (:team_id, :student_id, :role)
          ON DUPLICATE KEY UPDATE role = VALUES(role)"""),
        {"team_id": team["id"], "student_id": student_id, "role": role},
    )
    return team


def select_problem(conn, team_db_id, hackathon_id, problem_db_id):
    conn.execute(
        text("""INSERT INTO team_problem_selection (team_id, hackathon_id, problem_statement_id)
          VALUES (:team_id, :hackathon_id, :problem_id)
          ON DUPLICATE KEY UPDATE hackathon_id = VALUES(hackathon_id),
          problem_statement_id = VALUES(problem_statement_id), selected_at = NOW()"""),
        {"team_id": team_db_id, "hackathon_id": hackathon_id, "problem_id": problem_db_id},
    )


def seed_test_cases(conn, problem_id):
        conn.execute(text("DELETE FROM workflow_test_cases WHERE problem_statement_id = :problem_id"), {"problem_id": problem_id})
        conn.execute(text("""INSERT INTO workflow_test_cases
            (problem_statement_id, test_name, input_data, expected_output, is_hidden)
            VALUES (:problem_id, 'Source attribution sample 1', 'spill-a', 'source-a', TRUE),
                         (:problem_id, 'Source attribution sample 2', 'spill-b', 'source-b', TRUE)"""), {"problem_id": problem_id})


def upsert_submission_and_evaluation(conn, submission_id, hackathon_id, problem_id, team_id, student_id, evaluator_id, score):
    conn.execute(
        text("""INSERT INTO workflow_submissions
          (submission_id, hackathon_id, problem_statement_id, team_id, submitted_by,
           file_path, file_name, submission_status)
          VALUES (:submission_id, :hackathon_id, :problem_id, :team_id, :student_id,
                  NULL, :file_name, 'EVALUATED')
          ON DUPLICATE KEY UPDATE hackathon_id = VALUES(hackathon_id),
          problem_statement_id = VALUES(problem_statement_id), team_id = VALUES(team_id),
          submitted_by = VALUES(submitted_by), submission_status = 'EVALUATED'"""),
        {"submission_id": submission_id, "hackathon_id": hackathon_id, "problem_id": problem_id,
         "team_id": team_id, "student_id": student_id, "file_name": f"{submission_id}.zip"},
    )
    submission = one(conn, "SELECT id FROM workflow_submissions WHERE submission_id = :submission_id", {"submission_id": submission_id})
    conn.execute(
        text("""DELETE FROM workflow_evaluations WHERE submission_id = :submission_id"""),
        {"submission_id": submission["id"]},
    )
    conn.execute(
        text("""INSERT INTO workflow_evaluations
          (submission_id, evaluator_id, innovation_score, technical_score, impact_score,
           feasibility_score, presentation_score, total_score, feedback, private_notes)
          VALUES (:submission_id, :evaluator_id, :innovation, :technical, :impact,
                  :feasibility, :presentation, :total, :feedback, :private_notes)"""),
        {"submission_id": submission["id"], "evaluator_id": evaluator_id,
         "innovation": score, "technical": score, "impact": score,
         "feasibility": score, "presentation": score, "total": score * 5,
         "feedback": "Seeded evaluation record from the organizer review workflow.",
         "private_notes": "Seeded for local presentation preparation."},
    )


def seed():
    if not STUDENT_EMAIL or not ORGANIZER_EMAIL:
        raise RuntimeError("Set SEED_STUDENT_EMAIL and SEED_ORGANIZER_EMAIL before running the seed.")
    with engine.begin() as conn:
        student = ensure_user(conn, STUDENT_EMAIL, "Existing Student", "PARTICIPANT")
        organizer = ensure_user(conn, ORGANIZER_EMAIL, "Existing Organizer", "ORGANIZER")
        seeded_students = [student]
        if EXTRA_PASSWORD:
            for index in range(2):
                seeded_students.append(ensure_user(conn, f"seed-team-{index + 1}@example.com", f"Seed Team Member {index + 1}", "PARTICIPANT", EXTRA_PASSWORD))

        hackathon_rows = [upsert_hackathon(conn, organizer["user_id"], *item) for item in HACKATHONS]
        primary = hackathon_rows[0]
        primary_problem = upsert_problem(conn, primary["id"], "PS-26143", "AI-Based Oil Spill Source Attribution", "Build a project that identifies likely oil spill sources from supplied observations.", "AI / Sustainability")
        second_problem = upsert_problem(conn, primary["id"], "PS-26144", "Cyber Threat Detection", "Build a project that detects suspicious activity in a software system.", "Cyber Security")
        upsert_problem(conn, hackathon_rows[1]["id"], "PS-26201", "Smart Healthcare Assistant", "Build a useful assistant for healthcare workflows.", "Healthcare")
        upsert_problem(conn, hackathon_rows[2]["id"], "PS-26301", "Community Resource Planner", "Build a resource planning application for communities.", "Social Impact")
        seed_test_cases(conn, primary_problem["id"])

        conn.execute(text("""INSERT INTO hackathon_participants (hackathon_id, student_id)
          VALUES (:hackathon_id, :student_id) ON DUPLICATE KEY UPDATE status = 'REGISTERED'"""), {"hackathon_id": primary["id"], "student_id": student["user_id"]})
        team = upsert_team(conn, primary["id"], "TEAM-SIH26-001", "VARUNA", student["user_id"])
        select_problem(conn, team["id"], primary["id"], primary_problem["id"])
        upsert_submission_and_evaluation(conn, "SUB-SIH26-001", primary["id"], primary_problem["id"], team["id"], student["user_id"], organizer["user_id"], 17.6)

        for index, score in enumerate((16.8, 16.2, 15.2), start=2):
            member = seeded_students[index - 1] if index - 1 < len(seeded_students) else student
            team_id = f"TEAM-SIH26-00{index}"
            team_name = ("Team Alpha", "Team Beta", "Team Gamma")[index - 2]
            conn.execute(
                text("""DELETE wtm FROM workflow_team_members wtm
                       JOIN workflow_teams wt ON wt.id = wtm.team_id
                       WHERE wt.team_id = :team_id"""),
                {"team_id": team_id},
            )
            team_row = upsert_team(conn, primary["id"], team_id, team_name, member["user_id"])
            problem = second_problem if index == 2 else primary_problem
            conn.execute(
                text("""INSERT INTO hackathon_participants (hackathon_id, student_id)
                       VALUES (:hackathon_id, :student_id)
                       ON DUPLICATE KEY UPDATE status = 'REGISTERED'"""),
                {"hackathon_id": primary["id"], "student_id": member["user_id"]},
            )
            select_problem(conn, team_row["id"], primary["id"], problem["id"])
            upsert_submission_and_evaluation(
                conn, f"SUB-SIH26-00{index}", primary["id"], problem["id"],
                team_row["id"], member["user_id"], organizer["user_id"], score,
            )

    print("Seed complete: SIH26-VIT-001 and related workflow records are ready.")


if __name__ == "__main__":
    seed()
