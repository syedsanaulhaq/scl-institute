@echo off
REM SCL Institute - Check Service Status

cls
echo.
echo ============================================
echo  SCL Institute - Service Status
echo ============================================
echo.

echo [1/2] Docker Services:
echo.
docker-compose ps
echo.

echo [2/2] Ubuntu LAMP Services:
echo.
echo Apache2:
wsl -u root -d Ubuntu-22.04 -- systemctl is-active apache2
echo MariaDB:
wsl -u root -d Ubuntu-22.04 -- systemctl is-active mysql
echo.

echo ============================================
echo  Service URLs
echo ============================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:4000
echo Moodle:    http://localhost:9090
echo.

echo ============================================
echo.
pause
