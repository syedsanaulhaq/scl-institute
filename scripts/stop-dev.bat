@echo off
REM Kill only nodemon and vite processes, not the npm process itself
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *nodemon*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vite*" 2>nul
timeout /t 1 /nobreak >nul
echo Development servers stopped
