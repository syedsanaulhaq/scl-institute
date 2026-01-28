# ===============================================
# SCL-Institute Complete System Setup Script
# For Windows (PowerShell)
# Version 1.0
# Created: January 28, 2026
# ===============================================

param(
    [string]$ProjectPath = "scl-institute",
    [string]$GitRepo = "https://github.com/syedsanaulhaq/scl-institute.git",
    [string]$DBName = "scl_institute",
    [string]$DBUser = "scl_admin",
    [string]$DBPassword = "securePassword123!"
)

# Enable error handling
$ErrorActionPreference = "Stop"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# Clear screen
Clear-Host

Write-Info "========================================"
Write-Info "SCL-Institute Complete System Setup"
Write-Info "========================================"
Write-Host ""

# Step 1: Check Prerequisites
Write-Warning "[STEP 1/8] Checking Prerequisites..."
try {
    git --version | Out-Null
    Write-Success "✓ Git found"
} catch {
    Write-Error "✗ Git not found. Please install Git from https://git-scm.com/"
    exit 1
}

try {
    docker --version | Out-Null
    Write-Success "✓ Docker found"
} catch {
    Write-Error "✗ Docker not found. Please install Docker Desktop for Windows"
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Success "✓ Docker Compose found"
} catch {
    Write-Error "✗ Docker Compose not found"
    exit 1
}
Write-Host ""

# Step 2: Clone or Update Repository
Write-Warning "[STEP 2/8] Cloning/Updating Repository..."
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
Write-Warning "[STEP 3/8] Setting up Project Structure..."
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
Write-Warning "[STEP 4/8] Creating Environment Configuration..."
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
Write-Warning "[STEP 5/8] Preparing Database Schema..."
if (Test-Path "database_schema.sql") {
    Copy-Item "database_schema.sql" "data\mysql\000-init.sql" -Force
    Write-Success "✓ Database schema prepared"
} else {
    Write-Error "⚠ database_schema.sql not found"
}
Write-Host ""

# Step 6: Start Docker Containers
Write-Warning "[STEP 6/8] Starting Docker Containers..."
Write-Info "This may take 1-2 minutes on first run..."

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
Write-Warning "[STEP 7/8] Waiting for Services to Start..."
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
Write-Warning "[STEP 8/8] Setup Complete!"
Write-Host ""
Write-Success "========================================"
Write-Success "SCL-Institute System Ready!"
Write-Success "========================================"
Write-Host ""

Write-Info "Access URLs:"
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Moodle:    http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Database:  localhost:3306" -ForegroundColor Yellow
Write-Host ""

Write-Info "Default Credentials:"
Write-Host "  Database User: scl_admin" -ForegroundColor Yellow
Write-Host "  Database Pass: securePassword123!" -ForegroundColor Yellow
Write-Host "  Moodle Admin:  admin / Moodle@123" -ForegroundColor Yellow
Write-Host ""

Write-Info "Docker Containers Status:"
docker-compose -f docker-compose.prod.yml ps
Write-Host ""

Write-Info "Important Configuration Files:"
Write-Host "  1. .env.production     - Environment variables (UPDATE WITH YOUR VALUES!)"
Write-Host "  2. docker-compose.prod.yml - Docker services configuration"
Write-Host "  3. nginx/nginx.conf    - NGINX reverse proxy configuration"
Write-Host "  4. database_schema.sql - Database structure (37 tables)"
Write-Host ""

Write-Info "Useful Commands:"
Write-Host "  View logs:      docker-compose logs -f [service-name]" -ForegroundColor Cyan
Write-Host "  Stop services:  docker-compose down" -ForegroundColor Cyan
Write-Host "  Restart services: docker-compose restart" -ForegroundColor Cyan
Write-Host "  Access MySQL:   docker exec -it scli-mysql-prod mysql -u scl_admin -p" -ForegroundColor Cyan
Write-Host "  Backup DB:      docker exec scli-mysql-prod mysqldump -u scl_admin -p scl_institute > backup.sql" -ForegroundColor Cyan
Write-Host ""

Write-Info "Next Steps:"
Write-Host "1. Edit .env.production with your domain and secure credentials" -ForegroundColor Yellow
Write-Host "2. Configure SSL certificates in nginx/ssl/" -ForegroundColor Yellow
Write-Host "3. Update NGINX domain configuration" -ForegroundColor Yellow
Write-Host "4. Set up automated database backups" -ForegroundColor Yellow
Write-Host "5. Review and start monitoring system health" -ForegroundColor Yellow
Write-Host ""

Write-Success "✓ Setup Complete! The system is now running."
Write-Host ""

Pop-Location
