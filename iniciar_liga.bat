@echo off
setlocal

set "PROJECT_DIR=%~dp0liga_project"
set "PYTHON_EXE=%PROJECT_DIR%\venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
    exit /b 1
)

cd /d "%PROJECT_DIR%"

start /b "" "%PYTHON_EXE%" manage.py runserver

timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:8000/
