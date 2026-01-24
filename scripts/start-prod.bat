@echo off
REM Production environment startup script for Windows

echo.
echo ========================================
echo SCL Institute - Production Environment
echo ========================================
echo.

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if .env.production exists
if not exist .env.production (
    echo Error: .env.production file not found!
    echo Please copy .env.production.example to .env.production and update values.
    pause
    exit /b 1
)

echo Starting production environment...
echo.
echo WARNING: This will start the production deployment!
echo Make sure you have updated all passwords in .env.production
echo.
pause

REM Load prod environment and start containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

if errorlevel 1 (
    echo Error: Failed to start production containers
    pause
    exit /b 1
)

echo.
echo ========================================
echo Production environment started!
echo ========================================
echo.
echo Services are running in the background.
echo.
echo View logs with: docker-compose -f docker-compose.prod.yml logs -f
echo Stop with: docker-compose -f docker-compose.prod.yml down
echo.
pause
