# Auto-commit and push on file change - Super Simple
# Just run this once, then save files and they automatically sync to GitHub

param(
    [string]$RepoPath = "C:\SCL System\scl-institute",
    [int]$WaitSeconds = 3  # Wait 3 seconds after save before committing
)

Set-Location $RepoPath

Write-Host "🔄 Auto-sync started. Saving files will auto-commit and push..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$lastCommit = Get-Date

while ($true) {
    # Check for changes
    $status = git status --porcelain
    
    if ($status) {
        Start-Sleep -Seconds $WaitSeconds
        
        # Double-check changes still exist (debounce)
        $status = git status --porcelain
        
        if ($status) {
            $time = Get-Date -Format "HH:mm:ss"
            
            # Commit
            git add -A
            $msg = "auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $msg
            
            # Push
            git push origin develop 2>$null
            
            Write-Host "[$time] ✅ Saved and synced to GitHub" -ForegroundColor Green
        }
    }
    
    Start-Sleep -Seconds 1
}
