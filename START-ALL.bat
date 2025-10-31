@echo off
echo.
echo ==========================================
echo   Bit-Lover - Start All Servers
echo ==========================================
echo.
echo This will start:
echo 1. Backend API Server (Port 3001)
echo 2. Frontend Dev Server (Port 8080)
echo.
echo Press Ctrl+C to stop both servers
echo.
pause

cd /d "%~dp0"

echo.
echo [1/2] Starting Backend Server...
start "Bit-Lover Backend" cmd /k "cd backend && node node_modules\ts-node\dist\bin.js src\server.ts"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Bit-Lover Frontend" cmd /k "node node_modules\vite\bin\vite.js --host"

echo.
echo ==========================================
echo   All Servers Started!
echo ==========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8080
echo Network:  http://10.144.133.85:8080
echo.
echo Login with:
echo   Email: demo@bitlover.app
echo   Password: demo123
echo.
echo Then access: http://10.144.133.85:8080/dashboard/market
echo.
echo Two command windows have opened.
echo Close them to stop the servers.
echo.
pause
