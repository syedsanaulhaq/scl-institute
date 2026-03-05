# ============================================
# AUTO-COMMIT WATCHER - Windows PowerShell
# ============================================
# Purpose: Watch for file changes and auto-commit to develop branch
# Usage: Run in background: powershell -NoProfile -ExecutionPolicy Bypass -File auto-commit-watcher.ps1

param(
    [string]$RepoPath = "C:\SCL System\scl-institute",
    [int]$CheckIntervalSeconds = 5,
    [string]$LogFile = "$RepoPath\.git\auto-commit.log"
)

# ============================================
# REQUIRED ENVIRONMENT VARIABLES
# ============================================
# Set these in your system environment:
# GIT_USERNAME - Your GitHub username
# GIT_EMAIL - Your GitHub email
# GIT_PERSONAL_TOKEN - Your GitHub Personal Access Token
# 
# To set environment variables on Windows:
# [System.Environment]::SetEnvironmentVariable("GIT_PERSONAL_TOKEN", "your-token", "User")

# Configuration - Uses environment variables for security
$GitBranch = "develop"
$GitUser = [System.Environment]::GetEnvironmentVariable("GIT_USERNAME")
$GitEmail = [System.Environment]::GetEnvironmentVariable("GIT_EMAIL")
$GitToken = [System.Environment]::GetEnvironmentVariable("GIT_PERSONAL_TOKEN")

if (-not $GitUser -or -not $GitEmail -or -not $GitToken) {
    Write-Host "ERROR: Required environment variables not set!" -ForegroundColor Red
    Write-Host "Please set: GIT_USERNAME, GIT_EMAIL, GIT_PERSONAL_TOKEN" -ForegroundColor Yellow
    exit 1
}

# Initialize logging
function Log-Message {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
    Write-Host $logEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "SUCCESS") { "Green" } else { "White" })
}

function Initialize-Repo {
    Set-Location $RepoPath
    # Configure git credentials
    git config user.name $GitUser
    git config user.email $GitEmail
    git remote set-url origin "https://$($GitUser):$($GitToken)@github.com/$($GitUser)/scl-institute.git"
    Log-Message "Repository initialized" "INFO"
}

function Watch-Files {
    $previousFiles = @{}
    $debounceTimer = @{}
    
    Log-Message "Starting file watcher on $RepoPath" "INFO"
    Log-Message "Watching for changes every $CheckIntervalSeconds seconds" "INFO"
    
    while ($true) {
        try {
            $currentFiles = Get-ChildItem -Path $RepoPath -Recurse -File -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName -notlike "*\.git*" -and $_.FullName -notlike "*node_modules*" } |
                ForEach-Object { @{ Path = $_.FullName; LastWriteTime = $_.LastWriteTime } }
            
            # Check for file changes
            foreach ($file in $currentFiles) {
                $filePath = $file.Path
                
                if (-not $previousFiles.ContainsKey($filePath)) {
                    # New file
                    Log-Message "New file detected: $filePath" "INFO"
                    $debounceTimer[$filePath] = Get-Date
                } elseif ($previousFiles[$filePath].LastWriteTime -ne $file.LastWriteTime) {
                    # File modified
                    Log-Message "File modified: $filePath" "INFO"
                    $debounceTimer[$filePath] = Get-Date
                }
            }
            
            # Check for deleted files
            foreach ($oldFile in $previousFiles.Keys) {
                if (-not ($currentFiles | Where-Object { $_.Path -eq $oldFile })) {
                    Log-Message "File deleted: $oldFile" "INFO"
                    $debounceTimer[$oldFile] = Get-Date
                }
            }
            
            # Commit if there are changes and debounce period has passed
            $now = Get-Date
            $commitNeeded = $false
            
            foreach ($file in $debounceTimer.Keys) {
                if (($now - $debounceTimer[$file]).TotalSeconds -ge 3) {
                    $commitNeeded = $true
                    break
                }
            }
            
            if ($commitNeeded -and (git status --porcelain)) {
                Set-Location $RepoPath
                git add -A
                $commitMessage = "auto: commit changes at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                git commit -m $commitMessage
                Log-Message "✅ Auto-committed: $commitMessage" "SUCCESS"
                
                # Clear debounce timers
                $debounceTimer.Clear()
                
                # Try to push
                try {
                    git push origin $GitBranch
                    Log-Message "✅ Pushed to GitHub" "SUCCESS"
                } catch {
                    Log-Message "⚠️  Push failed (may retry next cycle): $_" "WARNING"
                }
            }
            
            $previousFiles = @{}
            foreach ($file in $currentFiles) {
                $previousFiles[$file.Path] = $file
            }
            
            Start-Sleep -Seconds $CheckIntervalSeconds
        } catch {
            Log-Message "Error in file watcher: $_" "ERROR"
            Start-Sleep -Seconds 10
        }
    }
}

# Main execution
try {
    Initialize-Repo
    Watch-Files
} catch {
    Log-Message "Fatal error: $_" "ERROR"
    exit 1
}
