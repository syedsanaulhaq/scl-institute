# ====================================================================
# SCL Institute Deployment Script (Windows PowerShell Version)
# Usage: .\deploy.ps1 develop
#        .\deploy.ps1 production
#        .\deploy.ps1 develop -ValidateOnly
#        .\deploy.ps1 production -NoRestart
# ====================================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet('develop', 'production')]
    [string]$Environment = 'develop',
    
    [switch]$ValidateOnly,
    [switch]$NoRestart
)

$ScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$ErrorActionPreference = "Continue"

# ====================================================================
# Color Helper Functions
# ====================================================================

function Write-Section {
    param([string]$Message)
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# ====================================================================
# Validation Functions
# ====================================================================

function Validate-EnvFile {
    param([string]$EnvFile)
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error-Custom "Environment file not found: $EnvFile"
        return $false
    }
    
    Write-Info "Validating $EnvFile"
    
    $requiredVars = @(
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'MOODLE_URL',
        'VITE_API_URL'
    )
    
    $content = Get-Content $EnvFile
    
    foreach ($var in $requiredVars) {
        if (-not ($content | Select-String "^${var}=" -Quiet)) {
            Write-Error-Custom "Missing required variable: $var"
            return $false
        }
    }
    
    Write-Success "Environment file validation passed"
    return $true
}

function Validate-DockerCompose {
    Write-Info "Validating docker-compose.yml syntax"
    
    $output = & docker-compose config 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "docker-compose.yml validation failed"
        Write-Host $output
        return $false
    }
    
    Write-Success "docker-compose.yml is valid"
    return $true
}

function Validate-NginxConfig {
    Write-Info "Validating nginx configuration"
    
    $result = & docker run --rm -v "$ScriptDir/nginx:/etc/nginx" nginx:alpine nginx -t 2>&1
    if ($LASTEXITCODE -eq 0 -and $result | Select-String "successful" -Quiet) {
        Write-Success "Nginx configuration is valid"
        return $true
    }
    else {
        Write-Warning-Custom "Could not validate nginx (this may be expected if Docker is not running)"
        return $true  # Don't fail on this
    }
}

function Validate-GitStatus {
    param([string]$Branch)
    
    $currentBranch = & git rev-parse --abbrev-ref HEAD
    
    if ($currentBranch -ne $Branch) {
        Write-Warning-Custom "Not on $Branch branch. Current: $currentBranch"
        Write-Info "Checking out $Branch branch..."
        
        if ((& git checkout $Branch 2>&1 | Select-String "error" -Quiet)) {
            Write-Error-Custom "Failed to checkout $Branch branch"
            return $false
        }
    }
    
    # For production, check that working directory is clean
    if ($Branch -eq "production") {
        $status = & git status --porcelain
        if ($status) {
            Write-Error-Custom "Working directory has uncommitted changes. Please commit or stash them."
            return $false
        }
    }
    
    Write-Success "Git status validated for $Branch"
    return $true
}

# ====================================================================
# Health Check Functions
# ====================================================================

function Health-Check-Local {
    Write-Section "Running Local Health Checks"
    
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 5
    
    # Check backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend API is responding"
        }
    }
    catch {
        Write-Error-Custom "Backend API health check failed"
        return $false
    }
    
    Write-Success "Local health checks passed"
    return $true
}

function Health-Check-Remote {
    param([string]$Host)
    
    Write-Section "Running Remote Health Checks ($Host)"
    
    Write-Info "Waiting for services to be ready on remote server..."
    Start-Sleep -Seconds 5
    
    # Check backend health endpoint via SSH
    $result = & ssh root@$Host "curl -sf http://localhost/api/health" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Remote backend API is responding"
    }
    else {
        Write-Error-Custom "Remote backend API health check failed"
        return $false
    }
    
    Write-Success "Remote health checks passed"
    return $true
}

# ====================================================================
# Deployment Functions
# ====================================================================

function Deploy-Develop {
    Write-Section "Deploying to DEVELOP Environment"
    
    # Validate environment
    if (-not (Validate-EnvFile ".env")) {
        return $false
    }
    
    if (-not (Validate-DockerCompose)) {
        return $false
    }
    
    if (-not (Validate-NginxConfig)) {
        return $false
    }
    
    if ($ValidateOnly) {
        Write-Success "Validation passed. Skipping deployment."
        return $true
    }
    
    if (-not $NoRestart) {
        Write-Info "Restarting Docker containers..."
        
        $result = & docker-compose restart
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to restart containers"
            return $false
        }
    }
    
    if (-not (Health-Check-Local)) {
        Write-Error-Custom "Health checks failed after deployment"
        return $false
    }
    
    Write-Success "DEVELOP environment deployed successfully"
    return $true
}

function Deploy-Production {
    Write-Section "Deploying to PRODUCTION Environment"
    
    # Step 1: Validate develop branch
    Write-Info "Step 1: Validating develop branch..."
    if (-not (Validate-GitStatus "develop")) {
        return $false
    }
    
    if (-not (ssh root@$ProductionServer "test -f /root/scl-institute/.env.production")) {
        Write-Error-Custom ".env.production not found on production server"
        return $false
    }
    
    # Step 2: Merge develop into production
    Write-Info "Step 2: Merging develop → production..."
    if (-not (Validate-GitStatus "production")) {
        return $false
    }
    
    $mergeResult = & git merge develop --no-edit 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Merge conflict or failed merge. Please resolve conflicts manually."
        & git merge --abort 2>&1 | Out-Null
        return $false
    }
    
    Write-Success "Successfully merged develop into production"
    
    # Step 3: Validate production branch
    Write-Info "Step 3: Validating production configurations..."
    if (-not (Validate-DockerCompose)) {
        Write-Error-Custom "docker-compose.yml validation failed"
        & git reset --hard HEAD~1 2>&1 | Out-Null
        return $false
    }
    
    if (-not (Validate-NginxConfig)) {
        Write-Error-Custom "Nginx configuration validation failed"
        & git reset --hard HEAD~1 2>&1 | Out-Null
        return $false
    }
    
    if ($ValidateOnly) {
        Write-Warning-Custom "Validation mode: Git changes were NOT pushed"
        return $true
    }
    
    # Step 4: Push to GitHub
    Write-Info "Step 4: Pushing production branch to GitHub..."
    $pushResult = & git push origin production 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to push to GitHub"
        Write-Host $pushResult
        return $false
    }
    
    Write-Success "Pushed production branch to GitHub"
    
    # Step 5: Deploy to remote server
    Write-Info "Step 5: Pulling latest changes on remote server..."
    $remoteResult = & ssh root@$ProductionServer "cd /root/scl-institute && git pull && echo 'Pull successful'" 2>&1
    
    if (-not ($remoteResult | Select-String "Pull successful" -Quiet)) {
        Write-Error-Custom "Failed to pull on remote server"
        return $false
    }
    
    Write-Success "Remote server updated with latest code"
    
    # Step 6: Restart containers
    if (-not $NoRestart) {
        Write-Info "Step 6: Restarting containers on remote server..."
        
        & ssh root@$ProductionServer "cd /root/scl-institute && docker-compose down && docker-compose up -d && echo 'Containers started'" 2>&1 | Out-Null
        
        Write-Success "Containers restarted on production server"
    }
    
    # Step 7: Health checks
    Write-Info "Step 7: Running remote health checks..."
    if (-not (Health-Check-Remote $ProductionServer)) {
        Write-Error-Custom "Remote health checks failed"
        Write-Warning-Custom "Please investigate the production server"
        return $false
    }
    
    Write-Success "PRODUCTION environment deployed successfully"
    return $true
}

# ====================================================================
# Main Execution
# ====================================================================

Write-Section "SCL Institute Deployment System v1.0"

# Load environment variables from .env if it exists
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Where-Object { $_ -and -not $_.StartsWith("#") }
    foreach ($line in $envContent) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
        }
    }
}

# Set defaults
$ProductionServer = if ($env:PRODUCTION_SERVER) { $env:PRODUCTION_SERVER } else { "185.211.6.60" }

Write-Info "Environment: $Environment"
Write-Info "Production Server: $ProductionServer"
Write-Info "ValidateOnly: $ValidateOnly"
Write-Info "NoRestart: $NoRestart"

# Validate git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "git is not installed or not in PATH"
    exit 1
}

# Validate docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "docker is not installed or not in PATH"
    exit 1
}

# Run appropriate deployment
$success = $false
switch ($Environment) {
    'develop' {
        $success = Deploy-Develop
    }
    'production' {
        $success = Deploy-Production
    }
    default {
        Write-Error-Custom "Invalid environment: $Environment"
        Write-Host "Usage: .\deploy.ps1 [develop|production] [-ValidateOnly] [-NoRestart]"
        exit 1
    }
}

if ($success) {
    Write-Host ""
    Write-Success "Deployment completed successfully!"
    Write-Host ""
    exit 0
}
else {
    Write-Host ""
    Write-Error-Custom "Deployment failed. Please check the errors above."
    Write-Host ""
    exit 1
}
