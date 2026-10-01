@echo off
setlocal

set "FRONTEND_DIR=%~dp0liga_frontend"
set "BACKEND_DIST=%~dp0liga_project\frontend_dist"

echo ============================================
echo   Compilando el frontend (esto toma un rato)
echo ============================================

cd /d "%FRONTEND_DIR%"
call npm run build -- --configuration production
if errorlevel 1 (
    echo.
    echo Algo fallo al compilar. Revisa el error de arriba.
    pause
    exit /b 1
)

echo.
echo Copiando archivos compilados a liga_project\frontend_dist ...

if exist "%BACKEND_DIST%" (
    rmdir /s /q "%BACKEND_DIST%"
)
xcopy /E /I /Y "%FRONTEND_DIR%\www" "%BACKEND_DIST%" >nul

echo.
echo ============================================
echo   Listo. Ahora puedes usar iniciar_liga.bat
echo ============================================
pause
