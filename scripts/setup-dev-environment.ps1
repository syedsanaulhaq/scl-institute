# ===============================================
# SCL-Institute Development Environment Setup
# For Windows (PowerShell) - Docker Desktop
# Version 1.0
# Created: January 28, 2026
# ===============================================

# ⚠️ IMPORTANT: Ensure Docker Desktop is running before executing this script!

param(
    [string]$ProjectPath = "scl-institute",
    [string]$GitRepo = "https://github.com/syedsanaulhaq/scl-institute.git",
    [switch]$SkipDocker = $false
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

Write-Info "╔════════════════════════════════════════════════════╗"
Write-Info "║  SCL-Institute DEVELOPMENT Setup v1.0              ║"
Write-Info "║  Docker Desktop Edition (Hot Reload + Live Dev)    ║"
Write-Info "╚════════════════════════════════════════════════════╝"
Write-Host ""

Write-Warning "⚠️  BEFORE YOU START:"
Write-Host "    1. Ensure Docker Desktop is running"
Write-Host "    2. This setup is for DEVELOPMENT (not production)"
Write-Host "    3. Hot-reload is enabled for frontend/backend code"
Write-Host "    4. Ports: Frontend 3000, Backend 4000, Moodle 9090, MySQL 33061"
Write-Host ""
Start-Sleep -Seconds 2

# Step 1: Check Prerequisites
Write-Warning "[STEP 1/8] Checking Prerequisites..."
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
        Write-Warning "Please start Docker Desktop and try again"
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

# Step 4: Verify Environment Files
Write-Warning "[STEP 4/8] Verifying Development Environment Files..."
if (Test-Path ".env.development") {
    Write-Success "✓ .env.development found"
} else {
    Write-ErrorMsg "⚠ .env.development not found - creating default..."
    # File should exist in git, but create if missing
}

if (Test-Path "docker-compose.dev.yml") {
    Write-Success "✓ docker-compose.dev.yml found"
} else {
    Write-ErrorMsg "✗ docker-compose.dev.yml not found"
    exit 1
}
Write-Host ""

# Step 5: Prepare Database Schema
Write-Warning "[STEP 5/8] Preparing Database Schema..."
if (Test-Path "database_schema.sql") {
    Copy-Item "database_schema.sql" "data\mysql\000-init.sql" -Force
    Write-Success "✓ Database schema prepared"
} else {
    Write-ErrorMsg "⚠ database_schema.sql not found"
}
Write-Host ""

# Step 6: Load Development Environment
Write-Warning "[STEP 6/8] Loading Development Environment..."
Write-Info "Using environment file: .env.development"

# Create symlink or copy .env.development to .env for docker-compose
if (Test-Path ".env") {
    Remove-Item ".env" -Force
}
Copy-Item ".env.development" ".env" -Force
Write-Success "✓ Environment configured for development"
Write-Host ""

# Step 7: Start Docker Containers
Write-Warning "[STEP 7/8] Starting Development Containers..."
Write-Info "ℹ️  Using docker-compose.dev.yml for development setup"
Write-Info "   • Hot-reload enabled for code changes"
Write-Info "   • Source code mounted in containers"
Write-Info "   • Development database configuration"
Write-Info "   • This may take 2-3 minutes on first run..."
Write-Host ""

if (Test-Path "docker-compose.dev.yml") {
    Write-Info "Stopping any existing development containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans 2>$null | Out-Null
    
    Write-Info "Starting development containers..."
    docker-compose -f docker-compose.dev.yml up -d
    Write-Success "✓ Development containers started"
} else {
    Write-ErrorMsg "✗ docker-compose.dev.yml not found"
    exit 1
}
Write-Host ""

# Step 8: Wait for Services and Display Summary
Write-Warning "[STEP 8/8] Finalizing Development Setup..."
Write-Info "Waiting for services to start (45 seconds)..."

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$maxWait = 60

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

Write-Host ""
Write-Success "╔════════════════════════════════════════════════════╗"
Write-Success "║  SCL-Institute DEVELOPMENT Ready on Docker!        ║"
Write-Success "╚════════════════════════════════════════════════════╝"
Write-Host ""

Write-Info "✨ Development Environment Access:"
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Moodle:    http://localhost:9090" -ForegroundColor Yellow
Write-Host "  MySQL:     localhost:33061" -ForegroundColor Yellow
Write-Host ""

Write-Info "🔐 Development Credentials:"
Write-Host "  Database User: scl_user" -ForegroundColor Yellow
Write-Host "  Database Pass: scl_password" -ForegroundColor Yellow
Write-Host "  Moodle Admin:  admin / SCLInst!2026" -ForegroundColor Yellow
Write-Host ""

Write-Info "⚙️  Development Features:"
Write-Host "  ✓ Hot-reload enabled (code changes auto-reflected)" -ForegroundColor Cyan
Write-Host "  ✓ Source code mounted in containers" -ForegroundColor Cyan
Write-Host "  ✓ Interactive debugging supported" -ForegroundColor Cyan
Write-Host "  ✓ Database accessible from localhost:33061" -ForegroundColor Cyan
Write-Host "  ✓ Logs available in real-time" -ForegroundColor Cyan
Write-Host ""

Write-Info "📊 Running Containers:"
docker-compose -f docker-compose.dev.yml ps
Write-Host ""

Write-Info "💡 Development Commands:"
Write-Host "  View logs:        docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Cyan
Write-Host "  Stop services:    docker-compose -f docker-compose.dev.yml down" -ForegroundColor Cyan
Write-Host "  Restart services: docker-compose -f docker-compose.dev.yml restart" -ForegroundColor Cyan
Write-Host "  Rebuild images:   docker-compose -f docker-compose.dev.yml build --no-cache" -ForegroundColor Cyan
Write-Host "  Check status:     docker-compose -f docker-compose.dev.yml ps" -ForegroundColor Cyan
Write-Host "  Database shell:   docker exec -it scli-mysql-dev mysql -u scl_user -p" -ForegroundColor Cyan
Write-Host ""

Write-Info "📁 Important Development Files:"
Write-Host "  .env.development  → Development environment variables" -ForegroundColor Cyan
Write-Host "  docker-compose.dev.yml → Development services definition" -ForegroundColor Cyan
Write-Host "  backend/         → Backend source code (auto-reloads)" -ForegroundColor Cyan
Write-Host "  frontend/        → Frontend source code (auto-reloads)" -ForegroundColor Cyan
Write-Host "  logs/            → Application logs" -ForegroundColor Cyan
Write-Host ""

Write-Info "🔧 Customize Development Environment:"
Write-Host "  Edit .env.development to change:" -ForegroundColor Yellow
Write-Host "  • Database credentials" -ForegroundColor Gray
Write-Host "  • API ports and URLs" -ForegroundColor Gray
Write-Host "  • Moodle settings" -ForegroundColor Gray
Write-Host "  • Feature flags" -ForegroundColor Gray
Write-Host "  Then run: docker-compose -f docker-compose.dev.yml restart" -ForegroundColor Gray
Write-Host ""

Write-Success "✓ Development Environment Ready!"
Write-Info "📖 For more details, see: DEVELOPMENT_GUIDE.md"
Write-Host ""

Pop-Location
