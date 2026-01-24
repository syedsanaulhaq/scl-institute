@echo off
REM Stop all environments

echo.
echo Checking for running containers...
echo.

REM Check for dev containers
docker-compose -f docker-compose.dev.yml ps --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo Stopping development environment...
    docker-compose -f docker-compose.dev.yml down
    echo Development environment stopped.
    echo.
)

REM Check for prod containers
docker-compose -f docker-compose.prod.yml ps --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo Stopping production environment...
    docker-compose -f docker-compose.prod.yml down
    echo Production environment stopped.
    echo.
)

echo All environments stopped.
pause
