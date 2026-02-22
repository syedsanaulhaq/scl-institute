@echo off
REM SCL Institute - Check Service Status
cls
echo.
echo ============================================
echo  SCL Institute - Service Status
echo ============================================
echo.

echo [1/3] Docker Services:
echo.
docker-compose ps
echo.

echo [2/3] WSL Moodle Services:
echo.
echo Apache2:
wsl -u root -d Ubuntu-22.04 -- systemctl is-active apache2
echo MariaDB:
wsl -u root -d Ubuntu-22.04 -- systemctl is-active mysql
echo.

echo [3/3] Service URLs (if active):
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo   Moodle:   http://localhost:9090
echo.

echo ============================================
echo Check above for service status
echo ============================================
echo.
pause
