@echo off
REM Development environment startup script for Windows

echo.
echo ========================================
echo SCL Institute - Development Environment
echo ========================================
echo.

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting development environment...
echo.

REM Load dev environment and start containers
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

if errorlevel 1 (
    echo Error: Failed to start development containers
    pause
    exit /b 1
)

echo.
echo ========================================
echo Development environment started!
echo ========================================
echo.
echo Access the following services:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:4000/api
echo   - Moodle:    http://localhost:8080
echo   - MySQL:     localhost:33061
echo.
echo Use 'docker-compose -f docker-compose.dev.yml logs -f' to view logs
echo Use 'scripts\stop-dev.bat' to stop the environment
echo.
pause
