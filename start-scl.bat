@echo off
echo ==================================================
echo    SCL Institute - One-Command Startup
echo ==================================================
echo.

echo [1/3] Stopping any existing containers...
docker compose -f docker-compose.dev.yml down >nul 2>&1

echo [2/3] Starting all containers...
docker compose -f docker-compose.dev.yml up -d

echo [3/3] Waiting for services to be ready...
echo Waiting for MySQL...
:wait_mysql
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    timeout /t 5 /nobreak >nul
    goto wait_mysql
)

echo Waiting for Moodle...  
timeout /t 90 /nobreak >nul

echo Installing SSO plugin...
docker cp "moodle-scripts/local/sclsso" scli-moodle-dev:/opt/bitnami/moodle/local/ >nul 2>&1
docker exec scli-moodle-dev chown -R daemon:daemon /opt/bitnami/moodle/local/sclsso >nul 2>&1

echo.
echo ✅ SCL Institute is ready!
echo.
echo 🌐 Access URLs:
echo   Frontend:    http://localhost:3000
echo   Moodle LMS:  http://localhost:9090  
echo   Backend API: http://localhost:4000
echo.
echo 👥 Test Users:
echo   admin@scl.com / password    → Sarah Johnson (Manager)
echo   student@scl.com / password  → John Doe (Student)
echo   faculty@scl.com / password  → Dr. Emily Chen (Teacher)
echo.
echo 🔐 SSO Features:
echo   ✅ Real user names and identities
echo   ✅ Proper role assignments  
echo   ✅ Seamless login between systems
echo.
echo ==================================================