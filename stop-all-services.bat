@echo off
REM SCL Institute - Stop All Services
cls
echo.
echo ============================================
echo  Stopping SCL Institute Services
echo ============================================
echo.

echo [1/2] Stopping Docker Services...
docker-compose down
echo.

echo [2/2] Stopping WSL Services...
wsl -u root -d Ubuntu-22.04 -- systemctl stop apache2
echo Apache2 stopped
wsl -u root -d Ubuntu-22.04 -- systemctl stop mysql
echo MariaDB stopped
echo.

echo ============================================
echo All services stopped
echo ============================================
echo.
pause
