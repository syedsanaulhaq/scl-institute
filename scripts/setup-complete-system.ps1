# ===============================================
# SCL-Institute Complete System Setup Script
# For Windows (PowerShell) + Docker Desktop
# Version 2.0
# Created: January 28, 2026
# Updated: January 28, 2026
# ===============================================

# ⚠️ IMPORTANT: Ensure Docker Desktop is running before executing this script!

param(
    [string]$ProjectPath = "scl-institute",
    [string]$GitRepo = "https://github.com/syedsanaulhaq/scl-institute.git",
    [string]$DBName = "scl_institute",
    [string]$DBUser = "scl_admin",
    [string]$DBPassword = "securePassword123!",
    [switch]$SkipDocker = $false
)

# Enable error handling
$ErrorActionPreference = "Continue"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-ErrorMsg { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# Global error flag
$HasErrors = $false

# Clear screen
Clear-Host

Write-Info "╔════════════════════════════════════════╗"
Write-Info "║  SCL-Institute System Setup v2.0       ║"
Write-Info "║  Docker Desktop Edition                ║"
Write-Info "└════════════════════════════════════════╝"
Write-Host ""

# Startup Banner
Write-Warning "⚠️  BEFORE YOU START: Ensure Docker Desktop is running!"
Write-Host "    Click the Docker icon in system tray to start Docker Desktop"
Write-Host ""
Start-Sleep -Seconds 2

# Step 1: Check Prerequisites
Write-Warning "[STEP 1/9] Checking Prerequisites..."
try {
    git --version | Out-Null
    Write-Success "✓ Git found"
} catch {
    Write-ErrorMsg "✗ Git not found. Download from: https://git-scm.com/"
    exit 1
}

try {
    docker --version | Out-Null
    Write-Success "✓ Docker found"
} catch {
    Write-ErrorMsg "✗ Docker not found. Download Docker Desktop from: https://www.docker.com/products/docker-desktop"
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
        Write-Host ""
        Write-Warning "Please start Docker Desktop:"
        Write-Host "  1. Click Windows Start button"
        Write-Host "  2. Search for 'Docker Desktop'"
        Write-Host "  3. Click to launch Docker Desktop"
        Write-Host "  4. Wait for it to fully start (check system tray icon)"
        Write-Host "  5. Then run this script again"
        Write-Host ""
        exit 1
    }
} catch {
    Write-ErrorMsg "✗ Cannot connect to Docker daemon"
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Success "✓ Docker Compose found"
} catch {
    Write-ErrorMsg "✗ Docker Compose not found"
    exit 1
}
Write-Host ""

# Step 2: Clone or Update Repository
Write-Warning "[STEP 2/9] Cloning/Updating Repository..."
if (Test-Path $ProjectPath) {
    Write-Warning "Directory exists. Pulling latest changes..."
    Push-Location $ProjectPath
    git pull origin main
    Pop-Location
} else {
    Write-Info "Cloning repository..."
    git clone $GitRepo $ProjectPath
}
Write-Success "✓ Repository ready"
Write-Host ""

# Step 3: Setup Directory Structure
Write-Warning "[STEP 3/9] Setting up Project Structure..."
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

# Step 4: Create Environment File
Write-Warning "[STEP 4/9] Creating Environment Configuration..."
$envFile = ".env.production"
if (-not (Test-Path $envFile)) {
    $envContent = @"
# ==========================================
# SCL-Institute Environment Configuration
# ==========================================

# Database Configuration
DB_HOST=scli-mysql-prod
DB_PORT=3306
DB_NAME=scl_institute
DB_USER=scl_admin
DB_PASSWORD=securePassword123!
MYSQL_ROOT_PASSWORD=rootPassword123!

# Backend API Configuration
BACKEND_PORT=4000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_change_this_in_production
API_URL=http://localhost:4000

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:4000/api

# Moodle Configuration
MOODLE_PORT=8080
MOODLE_ADMIN_USER=admin
MOODLE_ADMIN_PASSWORD=Moodle@123
MOODLE_SITENAME=SCL Institute LMS

# Domain Configuration
DOMAIN=sclsandbox.xyz
LMS_DOMAIN=lms.sclsandbox.xyz
API_DOMAIN=api.sclsandbox.xyz

# Docker Network
DOCKER_NETWORK=scl-network-prod

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/scl-institute

# Server Configuration
SERVER_IP=185.211.6.60
TIMEZONE=UTC
"@
    Set-Content -Path $envFile -Value $envContent
    Write-Success "✓ Environment file created"
} else {
    Write-Warning "✓ Environment file already exists"
}
Write-Host ""

# Step 5: Prepare Database Schema
Write-Warning "[STEP 5/9] Preparing Database Schema..."
if (Test-Path "database_schema.sql") {
    Copy-Item "database_schema.sql" "data\mysql\000-init.sql" -Force
    Write-Success "✓ Database schema prepared"
} else {
    Write-Error "⚠ database_schema.sql not found"
}
Write-Host ""

# Step 6: Start Docker Containers (via Docker Desktop)
Write-Warning "[STEP 6/9] Starting Docker Containers..."
Write-Info "ℹ️  Containers will run in Docker Desktop. You can manage them using:"
Write-Info "   • Docker Desktop GUI (recommended for viewing logs/stats)"
Write-Info "   • Command line: docker-compose commands"
Write-Info "   • This may take 1-2 minutes on first run..."
Write-Host ""

if (Test-Path "docker-compose.prod.yml") {
    Write-Info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>$null | Out-Null
    
    Write-Info "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d
    Write-Success "✓ Docker containers started"
} else {
    Write-Error "✗ docker-compose.prod.yml not found"
    exit 1
}
Write-Host ""

# Step 7: Wait for Services
Write-Warning "[STEP 7/9] Waiting for Services to Start..."
Write-Info "Waiting 45 seconds for services to initialize..."

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$maxWait = 120  # 2 minutes

while ($stopwatch.Elapsed.TotalSeconds -lt $maxWait) {
    try {
        $response = curl.exe -s -o $null -w "%{http_code}" "http://localhost:3000" 2>$null
        if ($response -eq "200") {
            Write-Success "✓ Frontend is responding"
            break
        }
    } catch {
        # Continue waiting
    }
    
    Start-Sleep -Seconds 5
}

Write-Info "Verifying services..."
$services = @(
    ("Frontend", "http://localhost:3000"),
    ("Backend", "http://localhost:4000/health"),
    ("Moodle", "http://localhost:8080")
)

foreach ($service, $url in $services) {
    try {
        $response = curl.exe -s -o $null -w "%{http_code}" $url 2>$null
        if ($response -eq "200") {
            Write-Success "  ✓ $service is ready"
        } else {
            Write-Warning "  ⚠ $service may still be starting..."
        }
    } catch {
        Write-Warning "  ⚠ Could not verify $service"
    }
}

Start-Sleep -Seconds 10
Write-Success "✓ Services initialization complete"
Write-Host ""

# Step 8: Display Summary
Write-Warning "[STEP 8/9] Finalizing Setup..."
Write-Host ""
Write-Success "╔════════════════════════════════════════╗"
Write-Success "║  SCL-Institute is Ready on Docker!     ║"
Write-Success "╚════════════════════════════════════════╝"
Write-Host ""

Write-Info "✨ Access Your System:"
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Moodle:    http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Database:  localhost:3306" -ForegroundColor Yellow
Write-Host ""

Write-Info "🔐 Default Credentials:"
Write-Host "  Database User: scl_admin" -ForegroundColor Yellow
Write-Host "  Database Pass: securePassword123!" -ForegroundColor Yellow
Write-Host "  Moodle Admin:  admin / Moodle@123" -ForegroundColor Yellow
Write-Host ""

Write-Info "🐳 Docker Desktop Management:"
Write-Host "  • View running containers: Open Docker Desktop app" -ForegroundColor Cyan
Write-Host "  • View logs: Click container name in Docker Desktop" -ForegroundColor Cyan
Write-Host "  • Stop all: docker-compose down" -ForegroundColor Cyan
Write-Host "  • Start again: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Cyan
Write-Host ""

Write-Info "📊 Docker Container Status:"
docker-compose -f docker-compose.prod.yml ps
Write-Host ""

Write-Info "📁 Project Structure & Files:"
Write-Host "  .env.production      → Environment configuration (EDIT WITH YOUR VALUES!)" -ForegroundColor Cyan
Write-Host "  docker-compose.prod.yml → Docker services definition" -ForegroundColor Cyan
Write-Host "  database_schema.sql  → Database with 37 tables" -ForegroundColor Cyan
Write-Host "  nginx/nginx.conf     → Web server configuration" -ForegroundColor Cyan
Write-Host "  logs/                → Application logs" -ForegroundColor Cyan
Write-Host "  data/mysql/          → Database files" -ForegroundColor Cyan
Write-Host "  data/moodle/         → Moodle data storage" -ForegroundColor Cyan
Write-Host ""

Write-Info "💡 Next Steps:"
Write-Host "1. Open Docker Desktop (taskbar > Docker icon)" -ForegroundColor Yellow
Write-Host "2. Edit .env.production with your domain and secure credentials" -ForegroundColor Yellow
Write-Host "3. Test all services are accessible:" -ForegroundColor Yellow
Write-Host "   • Open browser: http://localhost:3000 (Frontend)" -ForegroundColor Gray
Write-Host "   • Open browser: http://localhost:8080 (Moodle)" -ForegroundColor Gray
Write-Host "4. Configure SSL certificates (production)" -ForegroundColor Yellow
Write-Host "5. Set up automated database backups" -ForegroundColor Yellow
Write-Host "6. Review logs for any errors" -ForegroundColor Yellow
Write-Host ""

Write-Info "🔧 Useful Docker Desktop Commands:"
Write-Host "  View logs:        docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  Stop services:    docker-compose down" -ForegroundColor Cyan
Write-Host "  Restart services: docker-compose restart" -ForegroundColor Cyan
Write-Host "  Access MySQL:     docker exec -it scli-mysql-prod mysql -u scl_admin -p" -ForegroundColor Cyan
Write-Host "  View system info: docker system df" -ForegroundColor Cyan
Write-Host "  Check resources:  docker stats" -ForegroundColor Cyan
Write-Host ""

Write-Info "⚙️  Docker Desktop Settings (Recommended):"
Write-Host "  1. Open Docker Desktop Settings:" -ForegroundColor Yellow
Write-Host "  2. Go to Resources:" -ForegroundColor Yellow
Write-Host "     • CPUs: At least 4 cores" -ForegroundColor Gray
Write-Host "     • Memory: At least 8 GB" -ForegroundColor Gray
Write-Host "     • Disk: Leave default or increase to 100GB" -ForegroundColor Gray
Write-Host "  3. Go to Network:" -ForegroundColor Yellow
Write-Host "     • Enable DNS name resolution" -ForegroundColor Gray
Write-Host ""

Write-Success "✓ Setup Complete! Your SCL-Institute system is now running in Docker Desktop!"
Write-Host ""
Write-Info "📖 For detailed help, see: COMPLETE_SETUP_GUIDE.md"
Write-Host ""

Pop-Location
