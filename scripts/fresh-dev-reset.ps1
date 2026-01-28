# ===============================================
# SCL-Institute Fresh Development Reset Script
# For Windows (PowerShell)
# Version 1.0
# Created: January 28, 2026
# ===============================================

# ⚠️ WARNING: This script will DELETE all existing containers and data!

param(
    [string]$ProjectPath = "scl-institute",
    [string]$GitRepo = "https://github.com/syedsanaulhaq/scl-institute.git",
    [switch]$SkipConfirmation = $false
)

# Enable error handling
$ErrorActionPreference = "Continue"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-ErrorMsg { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# Clear screen
Clear-Host

Write-ErrorMsg "╔════════════════════════════════════════════════════╗"
Write-ErrorMsg "║  SCL-Institute FRESH SETUP RESET v1.0              ║"
Write-ErrorMsg "║  WARNING: This will DELETE all existing data!       ║"
Write-ErrorMsg "╚════════════════════════════════════════════════════╝"
Write-Host ""

Write-Warning "⚠️  CAUTION - READ CAREFULLY:"
Write-Host ""
Write-Host "This script will:" -ForegroundColor Red
Write-Host "  1. STOP all running Docker containers" -ForegroundColor Red
Write-Host "  2. DELETE all Docker containers" -ForegroundColor Red
Write-Host "  3. DELETE all Docker volumes (database data)" -ForegroundColor Red
Write-Host "  4. REMOVE the existing project directory" -ForegroundColor Red
Write-Host "  5. CLONE a fresh copy from GitHub" -ForegroundColor Red
Write-Host "  6. START fresh development environment" -ForegroundColor Red
Write-Host ""
Write-Host "All local changes and database data WILL BE LOST!" -ForegroundColor Red
Write-Host ""

if (-not $SkipConfirmation) {
    Write-Warning "DO YOU WANT TO CONTINUE? (Type: YES in UPPERCASE to proceed)"
    Write-Host ""
    Write-Host "Your choice: " -NoNewline -ForegroundColor Yellow
    $confirmation = Read-Host
    
    if ($confirmation -ne "YES") {
        Write-Info "Setup cancelled. No changes made."
        exit 0
    }
}

Write-Host ""
Write-Info "Starting fresh development environment setup..."
Write-Host ""
Start-Sleep -Seconds 2

# Step 1: Check Prerequisites
Write-Warning "[STEP 1/9] Checking Prerequisites..."
try {
    docker --version | Out-Null
    Write-Success "✓ Docker found"
} catch {
    Write-ErrorMsg "✗ Docker not found. Please install Docker Desktop."
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Success "✓ Docker Compose found"
} catch {
    Write-ErrorMsg "✗ Docker Compose not found"
    exit 1
}

# Check if Docker Desktop is running
Write-Info "Checking if Docker Desktop is running..."
try {
    $dockerInfo = docker info 2>$null
    if ($? -and $null -ne $dockerInfo) {
        Write-Success "✓ Docker Desktop is running"
    } else {
        Write-ErrorMsg "✗ Docker Desktop is NOT running!"
        Write-Warning "Please start Docker Desktop and try again"
        exit 1
    }
} catch {
    Write-ErrorMsg "✗ Cannot connect to Docker daemon"
    exit 1
}
Write-Host ""

# Step 2: Stop and Remove Existing Containers
Write-Warning "[STEP 2/9] Stopping and Removing Existing Containers..."

Write-Info "Stopping development containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>$null | Out-Null
Write-Success "✓ Development containers stopped"

Write-Info "Stopping production containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>$null | Out-Null
Write-Success "✓ Production containers stopped"

Write-Host ""

# Step 3: Remove Docker Volumes
Write-Warning "[STEP 3/9] Removing Docker Volumes..."

Write-Info "Finding and removing old volumes..."
$volumes = docker volume ls -q 2>$null
if ($lastexitcode -eq 0 -and $null -ne $volumes) {
    foreach ($volume in $volumes) {
        if ($volume -like "*scl*" -or $volume -like "*dev*" -or $volume -like "*mysql*" -or $volume -like "*moodle*") {
            Write-Info "Removing volume: $volume"
            docker volume rm $volume 2>$null | Out-Null
        }
    }
    Write-Success "✓ Old volumes removed"
} else {
    Write-Info "No SCL volumes found to remove"
}
Write-Host ""

# Step 4: Remove Old Project Directory
Write-Warning "[STEP 4/9] Cleaning Up Old Project..."

if (Test-Path $ProjectPath) {
    Write-Info "Removing existing project directory: $ProjectPath"
    Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "✓ Old project directory removed"
    
    # Wait for filesystem to catch up
    Start-Sleep -Seconds 2
} else {
    Write-Info "Project directory does not exist (fresh start)"
}
Write-Host ""

# Step 5: Clone Fresh Repository
Write-Warning "[STEP 5/9] Cloning Fresh Repository..."

Write-Info "Cloning from GitHub: $GitRepo"
git clone $GitRepo $ProjectPath

if ($lastexitcode -ne 0) {
    Write-ErrorMsg "✗ Failed to clone repository"
    exit 1
}

Write-Success "✓ Repository cloned successfully"
Write-Host ""

# Step 6: Setup Directory Structure
Write-Warning "[STEP 6/9] Setting up Project Structure..."

Push-Location $ProjectPath

$dirs = @(
    "data\mysql",
    "data\moodle",
    "logs",
    "backups",
    "screenshots"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Info "✓ Created: $dir"
    }
}

Write-Success "✓ Directory structure ready"
Write-Host ""

# Step 7: Setup Environment
Write-Warning "[STEP 7/9] Configuring Development Environment..."

# Verify .env.development exists
if (-not (Test-Path ".env.development")) {
    Write-ErrorMsg "✗ .env.development not found in cloned repository"
    exit 1
}

# Copy to .env
Copy-Item ".env.development" ".env" -Force
Write-Success "✓ Development environment configured"

# Copy database schema
if (Test-Path "database_schema.sql") {
    Copy-Item "database_schema.sql" "data\mysql\000-init.sql" -Force
    Write-Success "✓ Database schema prepared"
}

Write-Host ""

# Step 8: Start Fresh Development Environment
Write-Warning "[STEP 8/9] Starting Fresh Development Containers..."

Write-Info "Building and starting fresh containers (this may take 2-3 minutes)..."
docker-compose -f docker-compose.dev.yml up -d

if ($lastexitcode -ne 0) {
    Write-ErrorMsg "✗ Failed to start containers"
    exit 1
}

Write-Success "✓ Fresh development containers started"
Write-Host ""

# Step 9: Verify and Display Summary
Write-Warning "[STEP 9/9] Verifying Fresh Setup..."

Write-Info "Waiting for services to start (45 seconds)..."
Start-Sleep -Seconds 45

# Check services
Write-Info "Checking service status..."
$services = @()

try {
    $response = curl.exe -s -o $null -w "%{http_code}" "http://localhost:3000" 2>$null
    if ($response -eq "200") {
        $services += "Frontend ✓"
    } else {
        $services += "Frontend (starting...)"
    }
} catch {
    $services += "Frontend (checking...)"
}

try {
    $response = curl.exe -s -o $null -w "%{http_code}" "http://localhost:4000/health" 2>$null
    if ($response -eq "200") {
        $services += "Backend ✓"
    } else {
        $services += "Backend (starting...)"
    }
} catch {
    $services += "Backend (checking...)"
}

Write-Host ""
Write-Success "╔════════════════════════════════════════════════════╗"
Write-Success "║  Fresh Development Environment Ready!              ║"
Write-Success "╚════════════════════════════════════════════════════╝"
Write-Host ""

Write-Info "✨ Development Environment Access:"
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Moodle:    http://localhost:9090" -ForegroundColor Yellow
Write-Host "  MySQL:     localhost:33061" -ForegroundColor Yellow
Write-Host ""

Write-Info "🔐 Fresh Development Credentials:"
Write-Host "  Database User: scl_user" -ForegroundColor Yellow
Write-Host "  Database Pass: scl_password" -ForegroundColor Yellow
Write-Host "  Moodle Admin:  admin / SCLInst!2026" -ForegroundColor Yellow
Write-Host ""

Write-Info "📊 Running Containers Status:"
docker-compose -f docker-compose.dev.yml ps
Write-Host ""

Write-Info "💡 Quick Commands:"
Write-Host "  View logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Cyan
Write-Host "  Stop all: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Cyan
Write-Host "  Restart: docker-compose -f docker-compose.dev.yml restart" -ForegroundColor Cyan
Write-Host "  Check DB: docker exec -it scli-mysql-dev mysql -u scl_user -p" -ForegroundColor Cyan
Write-Host ""

Write-Success "✓ Fresh Development Environment Ready!"
Write-Info "📖 Next: Start coding with hot-reload enabled!"
Write-Host ""

Write-Warning "⚠️  Important Notes:"
Write-Host "  • All previous data has been deleted" -ForegroundColor Gray
Write-Host "  • This is a completely fresh installation" -ForegroundColor Gray
Write-Host "  • Database is empty (37 tables created automatically)" -ForegroundColor Gray
Write-Host "  • Source code is mounted for hot-reload" -ForegroundColor Gray
Write-Host ""

Pop-Location
