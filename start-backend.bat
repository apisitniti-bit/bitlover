@echo off
echo.
echo ========================================
echo   Starting Bit-Lover Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

echo Starting backend server with price sync...
echo.

node node_modules\ts-node\dist\bin.js src\server.ts

pause
