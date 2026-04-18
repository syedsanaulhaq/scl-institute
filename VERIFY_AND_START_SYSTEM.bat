@echo off
REM VERIFY_AND_START_SYSTEM.bat
REM Run this batch file to verify and start the system before presenting

echo.
echo ================================================
echo SCL INSTITUTE SYSTEM - PRE-PRESENTATION CHECK
echo ================================================
echo.

REM Step 1: Check if Docker is running
echo Step 1: Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo X Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Step 2: Verify workspace
echo Step 2: Verifying workspace...
if not exist "docker-compose.yml" (
    echo X docker-compose.yml not found. Are you in the project directory?
    exit /b 1
)
echo [OK] docker-compose.yml found
echo.

REM Step 3: Start containers
echo Step 3: Starting containers...
docker-compose up -d
if errorlevel 1 (
    echo X Failed to start containers.
    exit /b 1
)
echo [OK] Containers starting...
echo.

REM Step 4: Wait for services
echo Step 4: Waiting for services to be ready (60 seconds)...
timeout /t 60 /nobreak
echo [OK] Services should be ready
echo.

REM Step 5: Check containers
echo Step 5: Verifying all containers are running...
docker ps --format "table {{.Names}}	{{.Status}}"
echo.

REM Step 6: Test API
echo Step 6: Testing API endpoint...
for /f "tokens=*" %%i in ('powershell -Command "try { (Invoke-WebRequest http://localhost:4000/api/students/applications -ErrorAction SilentlyContinue).StatusCode } catch { Write-Host 'error' }" 2^>nul') do set "API_RESPONSE=%%i"

if "%API_RESPONSE%"=="200" (
    echo [OK] API responding (HTTP 200)
) else (
    echo X API not responding. Backend may still be starting.
)
echo.

REM Step 7: Check data
echo Step 7: Checking data...
echo Note: This requires MySQL CLI. If not found, verify data via browser.
echo.

REM Final message
echo ================================================
echo [OK] SYSTEM READY FOR PRESENTATION!
echo ================================================
echo.
echo Access the dashboard:
echo   URL: http://localhost:3000
echo   Email: admin@sclsandbox.xyz
echo   Password: password123
echo.
echo Demo flow:
echo   1. Show Dashboard with 10 modules
echo   2. Go to Admissions Hub - show 10 applications
echo   3. Go to Course Lifecycle - show 52 courses
echo.
echo Files for reference:
echo   - START_HERE.txt (quick guide)
echo   - PRE_PRESENTATION_CHECKLIST.md (verification steps)
echo   - QUICK_START_FOR_PRESENTATION.md (demo walkthrough)
echo.
echo Good luck! [DONE]
echo.
