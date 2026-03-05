$TaskName = "SCL-AutoSync"
$ScriptPath = "C:\SCL System\scl-institute\auto-sync.ps1"

# Create task to run script at startup
$TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

$TaskTrigger = New-ScheduledTaskTrigger -AtStartup

$TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

$Task = New-ScheduledTask -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings

Register-ScheduledTask -TaskName $TaskName -InputObject $Task -Force

Write-Host "✅ Auto-sync will now start every time Windows starts" -ForegroundColor Green
Write-Host "Running in background - no manual action needed" -ForegroundColor Green
