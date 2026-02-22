# Upload Local Database to Production Server
# This script uploads the local database backup to production and restores it

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SCL Institute - Upload Database to Production" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$backupFile = "scl_institute_backup_prod.sql"
$server = "root@185.211.6.60"

# Check if backup file exists
if (-not (Test-Path $backupFile)) {
    Write-Host "❌ Error: Backup file not found: $backupFile" -ForegroundColor Red
    Write-Host "   Run this command first to create backup:" -ForegroundColor Yellow
    Write-Host "   docker exec scli-mysql-dev mysqldump -u scl_user -pscl_password --no-tablespaces scl_institute > scl_institute_backup_prod.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found backup file: $backupFile" -ForegroundColor Green
$fileSize = (Get-Item $backupFile).Length / 1KB
Write-Host "  Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
Write-Host ""

# Upload to server
Write-Host "📤 Uploading database to production server..." -ForegroundColor Yellow
Write-Host "   Server: 185.211.6.60" -ForegroundColor Gray
Write-Host ""

scp $backupFile ${server}:/tmp/scl_institute_restore.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Upload successful!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Now run this command on the SERVER (185.211.6.60):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ssh root@185.211.6.60" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then on the server, run:" -ForegroundColor Cyan
    Write-Host ""
    
    $commands = @"
# Restore the database
docker exec -i scli-mysql-prod mysql -u scl_user -pSclSecurePass2024! scl_institute < /tmp/scl_institute_restore.sql

# Restart backend
docker restart scli-backend-prod

# Verify
docker logs scli-backend-prod --tail 20
"@
    
    Write-Host $commands -ForegroundColor White
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ Ready to restore on production!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
} else {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "   Make sure you can SSH to the server" -ForegroundColor Yellow
    exit 1
}
