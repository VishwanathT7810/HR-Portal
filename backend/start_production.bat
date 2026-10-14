@echo off
title HR Employee Information - Backend API Service
cd /d "%~dp0"

echo ====================================================
echo Starting HR Employee Information Backend (FastAPI)
echo ====================================================

REM Ensure virtual environment python is used
set PYTHON_EXE=.\.venv\Scripts\python.exe

if not exist "%PYTHON_EXE%" (
    echo Error: Python virtual environment not found in .\.venv
    pause
    exit /b 1
)

echo Starting Uvicorn on 0.0.0.0:8000 ...
"%PYTHON_EXE%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

pause
