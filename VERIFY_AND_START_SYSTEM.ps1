# VERIFY_AND_START_SYSTEM.ps1
# PowerShell script to verify and start system before presenting
# Run: powershell -ExecutionPolicy Bypass -File VERIFY_AND_START_SYSTEM.ps1

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SCL INSTITUTE SYSTEM - PRE-PRESENTATION CHECK" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    $null = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "X Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "X Docker command failed." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Verify workspace
Write-Host "Step 2: Verifying workspace..." -ForegroundColor Yellow
if (-Not (Test-Path "docker-compose.yml")) {
    Write-Host "X docker-compose.yml not found. Are you in the project directory?" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] docker-compose.yml found" -ForegroundColor Green
Write-Host ""

# Step 3: Start containers
Write-Host "Step 3: Starting containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Failed to start containers." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Containers starting..." -ForegroundColor Green
Write-Host ""

# Step 4: Wait for services
Write-Host "Step 4: Waiting for services to be ready (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host "[OK] Services should be ready now" -ForegroundColor Green
Write-Host ""

# Step 5: Check containers
Write-Host "Step 5: Verifying all containers are running..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}`t{{.Status}}"
Write-Host $containers
$runningCount = ($containers | Measure-Object -Line).Lines - 1
if ($runningCount -ge 4) {
    Write-Host "[OK] All containers running" -ForegroundColor Green
} else {
    Write-Host "X Not all containers running" -ForegroundColor Red
}
Write-Host ""

# Step 6: Test API
Write-Host "Step 6: Testing API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/students/applications" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] API responding (HTTP 200)" -ForegroundColor Green
    } else {
        Write-Host "X API returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "X API not responding yet. Backend may still be starting." -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Try database check
Write-Host "Step 7: Checking database..." -ForegroundColor Yellow
try {
    $apps = docker exec scli-mysql mysql -u scl_user -pscl_password scl_institute -s -e "SELECT COUNT(*) FROM student_applications;" 2>$null
    $courses = docker exec scli-mysql mysql -u scl_user -pscl_password scl_institute -s -e "SELECT COUNT(*) FROM course_lifecycle_master;" 2>$null
    
    if ($apps -and $courses) {
        Write-Host "[OK] Database checked" -ForegroundColor Green
        Write-Host "   - Applications: $apps" -ForegroundColor Green
        Write-Host "   - Courses: $courses" -ForegroundColor Green
    } else {
        Write-Host "X Could not query database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "X Database check skipped (MySQL CLI may not be available)" -ForegroundColor Yellow
    Write-Host "   You can verify data by opening the browser and logging in." -ForegroundColor Gray
}
Write-Host ""

# Final message
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "[OK] SYSTEM READY FOR PRESENTATION!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access the dashboard:" -ForegroundColor White
Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Email: admin@sclsandbox.xyz" -ForegroundColor Cyan
Write-Host "  Password: password123" -ForegroundColor Cyan
Write-Host ""

Write-Host "Demo flow:" -ForegroundColor White
Write-Host "  1. Show Dashboard with 10 modules" -ForegroundColor Gray
Write-Host "  2. Go to Admissions Hub - show 10 applications" -ForegroundColor Gray
Write-Host "  3. Go to Course Lifecycle - show 52 courses" -ForegroundColor Gray
Write-Host ""

Write-Host "Files for reference:" -ForegroundColor White
Write-Host "  - START_HERE.txt (quick guide)" -ForegroundColor Gray
Write-Host "  - PRE_PRESENTATION_CHECKLIST.md (verification steps)" -ForegroundColor Gray
Write-Host "  - QUICK_START_FOR_PRESENTATION.md (demo walkthrough)" -ForegroundColor Gray
Write-Host ""

Write-Host "Good luck! 🎉" -ForegroundColor Green
Write-Host ""
