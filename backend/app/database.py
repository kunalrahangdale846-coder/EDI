import os

from contextlib import contextmanager
from dotenv import load_dotenv
from sqlalchemy import URL, create_engine, text


# Explicitly load backend/.env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)


def mysql_url() -> str:
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "3306")
    name = os.environ.get("DB_NAME", "devcollab")
    user = os.environ.get("DB_USER", "root")
    password = os.environ.get("DB_PASSWORD", "")

    return URL.create(
        "mysql+pymysql",
        username=user,
        password=password,
        host=host,
        port=int(port),
        database=name,
    )


engine = create_engine(
    mysql_url(),
    pool_pre_ping=True,
    future=True
)


@contextmanager
def connection():
    with engine.begin() as conn:
        yield conn


def fetch_one(sql: str, params: dict | None = None):
    with engine.connect() as conn:
        return conn.execute(
            text(sql),
            params or {}
        ).mappings().first()


def fetch_all(sql: str, params: dict | None = None):
    with engine.connect() as conn:
        return conn.execute(
            text(sql),
            params or {}
        ).mappings().all()


def execute(sql: str, params: dict | None = None):
    with engine.begin() as conn:
        result = conn.execute(
            text(sql),
            params or {}
        )

        if result.returns_rows:
            return result.mappings().first()

        return {
            "rowcount": result.rowcount,
            "lastrowid": result.lastrowid
        }