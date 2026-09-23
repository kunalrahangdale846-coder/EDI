# FastAPI + MySQL backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

The `.env` file must contain `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET`. It must never be committed. The evaluator receives ZIP submissions and runs them in a separate workspace; production Docker sandboxing is still required.
