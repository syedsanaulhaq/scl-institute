@echo off
echo Starting SCL Institute with automatic SSO installation...
echo.

echo [1/2] Starting all containers...
docker compose -f docker-compose.dev.yml up -d

echo.
echo [2/2] Installing SSO plugin automatically...
call scripts\install-sso-plugin.bat

echo.
echo ✅ SCL Institute is ready!
echo Frontend: http://localhost:3000
echo Moodle LMS: http://localhost:9090
echo Backend API: http://localhost:4000
echo.
echo SSO Features:
echo - Real user names (Sarah Johnson, John Doe, Dr. Emily Chen, etc.)
echo - Proper role assignment (Manager, Teacher, Student)  
echo - Automatic login between SCL ↔ Moodle
echo.
echo No manual steps needed after restarts!