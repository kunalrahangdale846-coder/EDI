@echo off
REM Start the DevCollab backend with MySQL credentials
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=devcollab
set DB_USER=root
set DB_PASSWORD=Kunal@2007
set JWT_SECRET=devcollab-pro-jwt-secret-2024-change-in-production
set FRONTEND_ORIGIN=http://localhost:5173
set CPP_EVALUATOR_PATH=../cpp-evaluator/evaluator.exe

cd /d "%~dp0\backend"
echo Starting DevCollab backend on http://127.0.0.1:8000 ...
"C:\Users\admin\anaconda3\python.exe" -m uvicorn app.main:app --reload --port 8000
