@echo off
REM SCL Institute - Start All Services
cls
echo.
echo ============================================
echo  SCL Institute - Starting All Services
echo ============================================
echo.

echo [1/4] Starting Docker services...
docker-compose up -d
echo [OK] Docker services started
echo.

echo [2/4] Waiting for services to initialize...
timeout /t 10 /nobreak
echo.

echo [3/4] Starting Moodle services...
wsl -u root -d Ubuntu-22.04 -- systemctl start mysql
wsl -u root -d Ubuntu-22.04 -- systemctl start apache2
echo [OK] Moodle services started
echo.

echo [4/4] Services Status:
docker-compose ps --services
echo.

echo Service URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo   Moodle:   http://localhost:9090
echo.

echo ============================================
echo [OK] All services started!
echo ============================================
echo.
echo To check status: check-services-status.ps1
echo To stop services: stop-all-services.ps1
echo.
pause
