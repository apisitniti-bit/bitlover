@echo off
echo ==========================================
echo   Starting Frontend Dev Server
echo ==========================================
echo.
echo Server will start on:
echo   - http://localhost:8080/
echo   - http://10.144.133.85:8080/
echo.
echo Press Ctrl+C to stop the server
echo.
pause
cd /d "%~dp0"
node node_modules\vite\bin\vite.js --host
pause
