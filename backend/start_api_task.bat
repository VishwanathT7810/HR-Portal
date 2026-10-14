@echo off
cd /d "C:\Users\BT\Desktop\new\Employee Information\backend"
echo. >> "C:\Users\BT\Desktop\new\Employee Information\backend\api_task.log"
echo ===== API start attempt %date% %time% ===== >> "C:\Users\BT\Desktop\new\Employee Information\backend\api_task.log"
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1 >> "C:\Users\BT\Desktop\new\Employee Information\backend\api_task.log" 2>&1
echo Uvicorn exited with code %errorlevel% at %date% %time% >> "C:\Users\BT\Desktop\new\Employee Information\backend\api_task.log"
