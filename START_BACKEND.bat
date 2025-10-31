@echo off
cd /d "%~dp0backend"
echo Starting BitLover Backend Server...
call npm run dev
