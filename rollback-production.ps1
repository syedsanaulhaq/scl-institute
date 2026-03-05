# ============================================
# ROLLBACK SCRIPT - Revert to previous production version
# ============================================
# Purpose: Quick rollback to a previous stable version
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File rollback-production.ps1
#
# REQUIRED ENVIRONMENT VARIABLES:
# REMOTE_SERVER - Production server IP/hostname
# REMOTE_USER - SSH username  
# REMOTE_PASS - SSH password

param(
    [string]$RepoPath = "C:\SCL System\scl-institute",
    [string]$RemoteServer = [System.Environment]::GetEnvironmentVariable("REMOTE_SERVER") -or "185.211.6.60",
    [string]$RemoteUser = [System.Environment]::GetEnvironmentVariable("REMOTE_USER") -or "root",
    [string]$RemotePass = [System.Environment]::GetEnvironmentVariable("REMOTE_PASS"),  # From environment variable
    [string]$LogFile = "C:\SCL System\scl-institute\rollback.log"
)

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

function Get-AvailableRollbacks {
    Log-Message "Fetching available rollback tags..." "INFO"
    
    Set-Location $RepoPath
    git fetch origin
    
    $tags = git tag | Where-Object { $_ -like "rollback_*" } | Sort-Object -Descending
    
    if ($tags.Count -eq 0) {
        Log-Message "No rollback tags available" "ERROR"
        exit 1
    }
    
    return $tags
}

function Show-RollbackOptions {
    param($tags)
    
    Write-Host ""
    Write-Host "Available rollback points:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    $tagList = @()
    $index = 1
    
    foreach ($tag in $tags) {
        $tagList += @{ Index = $index; Tag = $tag }
        Write-Host "[$index] $tag"
        $index++
    }
    
    Write-Host ""
    
    $selection = Read-Host "Select rollback point (enter number or tag name) or press 'C' to cancel"
    
    if ($selection -eq "C" -or $selection -eq "c") {
        Log-Message "Rollback cancelled" "INFO"
        exit 0
    }
    
    # Check if numeric selection
    if ($selection -match "^\d+$") {
        $selectedIndex = [int]$selection - 1
        if ($selectedIndex -ge 0 -and $selectedIndex -lt $tagList.Count) {
            return $tagList[$selectedIndex].Tag
        }
    } else {
        # Check if tag name matches
        $matching = $tagList | Where-Object { $_.Tag -eq $selection }
        if ($matching) {
            return $matching.Tag
        }
    }
    
    Log-Message "Invalid selection" "ERROR"
    exit 1
}

function Perform-Rollback {
    param([string]$RollbackTag)
    
    Log-Message "=========================================" "INFO"
    Log-Message "ROLLING BACK TO: $RollbackTag" "INFO"
    Log-Message "=========================================" "INFO"
    
    Set-Location $RepoPath
    
    # Confirmation
    Write-Host ""
    Write-Host "⚠️  WARNING:" -ForegroundColor Yellow
    Write-Host "This will revert code to: $RollbackTag" -ForegroundColor Yellow
    Write-Host "Current changes will be lost!" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Type 'ROLLBACK' to confirm or press Enter to cancel"
    
    if ($confirm -ne "ROLLBACK") {
        Log-Message "Rollback cancelled by user" "WARNING"
        exit 0
    }
    
    try {
        # Reset local repository
        Log-Message "Checking out rollback tag..." "INFO"
        git checkout $RollbackTag
        
        Log-Message "✅ Local repository rolled back to $RollbackTag" "SUCCESS"
        
        # Option to push to production
        Write-Host ""
        $pushConfirm = Read-Host "Push rollback to production? (yes/no)"
        
        if ($pushConfirm.ToLower() -eq "yes") {
            Log-Message "Pushing rollback to GitHub..." "INFO"
            git push origin HEAD:production --force
            Log-Message "✅ Pushed to production" "SUCCESS"
            
            # Deploy to remote server
            Deploy-Rollback-Remote
        } else {
            Log-Message "Rollback applied locally only. Run deploy-to-production.ps1 to push." "WARNING"
        }
        
    } catch {
        Log-Message "❌ Rollback failed: $_" "ERROR"
        exit 1
    }
}

function Deploy-Rollback-Remote {
    Log-Message "Triggering remote deployment..." "INFO"
    
    $sshCmd = "ssh"
    if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
        $sshCmd = "C:\Program Files\PuTTY\plink.exe"
    }
    
    $REMOTE_PASS_VAR = $RemotePass
    
    try {
        & $sshCmd -l $RemoteUser -pw $REMOTE_PASS_VAR "$RemoteServer" "cd /home/scl-institute && bash ./pull-and-restart.sh"
        Log-Message "✅ Remote rollback completed" "SUCCESS"
    } catch {
        Log-Message "⚠️  Remote execution failed: $_" "WARNING"
        Log-Message "Run manually: ssh root@$RemoteServer 'cd /home/scl-institute && bash ./pull-and-restart.sh'" "INFO"
    }
}

function Show-Summary {
    param([string]$RollbackTag)
    
    Log-Message "=========================================" "SUCCESS"
    Log-Message "ROLLBACK COMPLETED" "SUCCESS"
    Log-Message "=========================================" "SUCCESS"
    Log-Message "Rollback Tag: $RollbackTag" "SUCCESS"
    Log-Message "Current Commit: $(git rev-parse --short HEAD)" "SUCCESS"
    Log-Message "Repository: $RepoPath" "SUCCESS"
    Log-Message "Log File: $LogFile" "SUCCESS"
    Log-Message "=========================================" "SUCCESS"
}

# Main execution
try {
    Log-Message "=========================================" "INFO"
    Log-Message "ROLLBACK WORKFLOW STARTED" "INFO"
    Log-Message "=========================================" "INFO"
    
    $availableTags = Get-AvailableRollbacks
    $selectedTag = Show-RollbackOptions $availableTags
    Perform-Rollback $selectedTag
    Show-Summary $selectedTag
    
} catch {
    Log-Message "Fatal error: $_" "ERROR"
    exit 1
}
