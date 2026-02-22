@echo off
REM SCL Institute - Start All Services
REM Architecture: Docker (Frontend, Backend, MySQL) + LAMP (Moodle) on Ubuntu WSL
REM All services accessible from Windows via localhost

cls
echo.
echo ============================================
echo  Starting SCL Institute
echo ============================================
echo.

echo [1/2] Starting Docker services (Frontend, Backend, MySQL)...
docker-compose up -d
echo.

echo [2/2] Starting Ubuntu LAMP services (Apache2, MariaDB)...
wsl -u root -d Ubuntu-22.04 -- systemctl start mysql
wsl -u root -d Ubuntu-22.04 -- systemctl start apache2
echo.

echo ============================================
echo  Services Configuration
echo ============================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:4000
echo Moodle:    http://localhost:9090
echo MySQL:     localhost:33062
echo.
echo SSO Flow:
echo   1. Login at: http://localhost:9090 or http://localhost:3000
echo   2. Backend generates token: /api/sso/generate
echo   3. Moodle verifies token: /api/sso/verify
echo   4. User logged in and courses visible
echo.

echo ============================================
echo  Verifying Services
echo ============================================
echo.

echo Docker services:
docker-compose ps

echo.
echo Ubuntu LAMP services:
wsl -u root -d Ubuntu-22.04 -- systemctl is-active apache2 mysql

echo.
echo ============================================
echo All services started successfully!
echo ============================================
echo.
pause
