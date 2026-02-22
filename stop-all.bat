@echo off
REM SCL Institute - Stop All Services

cls
echo.
echo ============================================
echo  Stopping SCL Institute Services
echo ============================================
echo.

echo Stopping Docker services...
docker-compose down
echo.

echo Stopping Ubuntu LAMP services...
wsl -u root -d Ubuntu-22.04 -- systemctl stop apache2
wsl -u root -d Ubuntu-22.04 -- systemctl stop mysql
echo.

echo ============================================
echo All services stopped
echo ============================================
echo.
pause
