# ============================================
# DEPLOYMENT SCRIPT - develop to production
# ============================================
# Purpose: Merge develop → production and deploy to remote server
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File deploy-to-production.ps1
#
# REQUIRED ENVIRONMENT VARIABLES (set before running):
# REMOTE_SERVER - IP/hostname of production server (default: 185.211.6.60)
# REMOTE_USER - SSH username (default: root)
# REMOTE_PASS - SSH password (stored in environment, not in script)
#
# To set environment variables on Windows:
# [System.Environment]::SetEnvironmentVariable("REMOTE_PASS", "your-password", "User")

param(
    [string]$RepoPath = "C:\SCL System\scl-institute",
    [string]$RemoteServer = [System.Environment]::GetEnvironmentVariable("REMOTE_SERVER") -or "185.211.6.60",
    [string]$RemoteUser = [System.Environment]::GetEnvironmentVariable("REMOTE_USER") -or "root",
    [string]$RemotePass = [System.Environment]::GetEnvironmentVariable("REMOTE_PASS"),  # From environment variable
    [string]$LogFile = "$RepoPath\deployment.log"
)

# Configuration - Uses environment variables for security
$GitToken = [System.Environment]::GetEnvironmentVariable("GIT_PERSONAL_TOKEN")

# Validate credentials
if (-not $RemotePass) {
    Write-Host "ERROR: REMOTE_PASS environment variable not set!" -ForegroundColor Red
    Write-Host "Please set: [System.Environment]::SetEnvironmentVariable('REMOTE_PASS', 'your-password', 'User')" -ForegroundColor Yellow
    exit 1
}

function Log-Message {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logEntry
    Write-Host $logEntry -ForegroundColor $(
        switch ($Level) {
            "ERROR" { "Red" }
            "SUCCESS" { "Green" }
            "WARNING" { "Yellow" }
            default { "White" }
        }
    )
}

function Test-Prerequisites {
    Log-Message "Checking prerequisites..." "INFO"
    
    # Check git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Log-Message "Git is not installed" "ERROR"
        exit 1
    }
    
    # Check SSH/PuTTY
    $sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue
    $puttyAvailable = Test-Path "C:\Program Files\PuTTY\plink.exe"
    
    if (-not $sshAvailable -and -not $puttyAvailable) {
        Log-Message "SSH or PuTTY is not available" "ERROR"
        Log-Message "Install OpenSSH or PuTTY to continue" "ERROR"
        exit 1
    }
    
    Log-Message "✅ Prerequisites verified" "SUCCESS"
}

function Merge-Branches {
    Log-Message "Merging develop → production..." "INFO"
    
    Set-Location $RepoPath
    
    # Update local branches
    git fetch origin
    
    # Checkout production
    git checkout production
    
    # Merge develop
    try {
        git merge origin/develop --no-edit
        Log-Message "✅ Successfully merged develop into production" "SUCCESS"
    } catch {
        Log-Message "❌ Merge failed: $_" "ERROR"
        Log-Message "Please resolve conflicts and try again" "ERROR"
        exit 1
    }
}

function Tag-Release {
    Log-Message "Creating release tag..." "INFO"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $commitHash = (git rev-parse --short HEAD)
    $releaseTag = "release_$timestamp`_$commitHash"
    
    git tag $releaseTag
    Log-Message "✅ Created tag: $releaseTag" "SUCCESS"
    
    return $releaseTag
}

function Push-To-GitHub {
    Log-Message "Pushing to GitHub..." "INFO"
    
    try {
        git push origin production
        git push origin --tags
        Log-Message "✅ Pushed to GitHub successfully" "SUCCESS"
    } catch {
        Log-Message "❌ Push to GitHub failed: $_" "ERROR"
        Log-Message "Code will still be deployed to production server" "WARNING"
    }
}

function Deploy-To-Production {
    param([string]$ReleaseTag)
    
    Log-Message "=========================================" "INFO"
    Log-Message "DEPLOYING TO PRODUCTION SERVER" "INFO"
    Log-Message "Server: $RemoteServer" "INFO"
    Log-Message "Tag: $ReleaseTag" "INFO"
    Log-Message "=========================================" "INFO"
    
    # Use PuTTY if SSH not available
    $sshCmd = "ssh"
    if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
        $sshCmd = "C:\Program Files\PuTTY\plink.exe"
    }
    
    # Deploy script to run on remote server
    $deployScript = @"
#!/bin/bash
set -e
export MYSQL_ROOT_PASSWORD=`$REMOTE_PASS

cd /home/scl-institute
echo "Current branch: \$(git rev-parse --abbrev-ref HEAD)"
echo "Current commit: \$(git rev-parse --short HEAD)"

echo "Pulling latest code..."
git pull origin production

echo "Creating database migration backup..."
mysqldump -u root -p\$MYSQL_ROOT_PASSWORD --all-databases > /tmp/pre-deploy-backup-\$(date +%s).sql

echo "Building Docker images..."
docker-compose build

echo "Stopping containers..."
docker-compose down

echo "Starting new containers..."
docker-compose up -d

echo "Waiting for services..."
sleep 10

echo "Verifying deployment..."
docker-compose ps

echo "Deployment complete!"
"@
    
    try {
        Log-Message "Executing deployment on remote server..." "INFO"
        
        # Send and execute script
        $output = $deployScript | & $sshCmd -l $RemoteUser -pw $RemotePass "$RemoteServer" "bash -s"
        
        Log-Message "Remote output:" "INFO"
        Log-Message $output "INFO"
        Log-Message "✅ Deployment to production completed successfully" "SUCCESS"
        
    } catch {
        Log-Message "❌ Remote deployment failed: $_" "ERROR"
        exit 1
    }
}

function Show-Summary {
    param([string]$ReleaseTag)
    
    Log-Message "=========================================" "SUCCESS"
    Log-Message "DEPLOYMENT COMPLETED SUCCESSFULLY" "SUCCESS"
    Log-Message "=========================================" "SUCCESS"
    Log-Message "Release Tag: $ReleaseTag" "SUCCESS"
    Log-Message "Remote Server: $RemoteServer" "SUCCESS"
    Log-Message "Repository: $RepoPath" "SUCCESS"
    Log-Message "Deployment Log: $LogFile" "SUCCESS"
    Log-Message "=========================================" "SUCCESS"
}

# Main execution
try {
    Log-Message "=========================================" "INFO"
    Log-Message "DEPLOYMENT WORKFLOW STARTED" "INFO"
    Log-Message "=========================================" "INFO"
    
    Test-Prerequisites
    
    # Confirmation prompt
    Write-Host ""
    Write-Host "⚠️  ATTENTION:" -ForegroundColor Yellow
    Write-Host "This will merge develop into production and deploy to $RemoteServer" -ForegroundColor Yellow
    Write-Host "Make sure all features are tested before proceeding!" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Type 'DEPLOY' to continue or 'N' to cancel"
    
    if ($confirm -ne "DEPLOY") {
        Log-Message "Deployment cancelled by user" "WARNING"
        exit 0
    }
    
    Merge-Branches
    $releaseTag = Tag-Release
    Push-To-GitHub
    Deploy-To-Production $releaseTag
    Show-Summary $releaseTag
    
} catch {
    Log-Message "Fatal error: $_" "ERROR"
    exit 1
}
