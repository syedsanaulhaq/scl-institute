param(
	[string]$RepoPath = "C:\SCL System\scl-institute",
	[string]$RemoteHost = "185.211.6.60",
	[string]$RemoteUser = "root",
	[string]$RemoteRepoPath = "/root/scl-institute",
	[string]$RemoteComposeFile = "docker-compose.prod.yml",
	[switch]$SkipBuild,
	[switch]$NoDbPrompt,
	[switch]$SyncSclDb,
	[switch]$SyncMoodleDb,
	[string]$SclLocalMysqlContainer = "scli-mysql-dev",
	[string]$SclLocalMysqlUser = "root",
	[string]$SclLocalMysqlPassword = "rootpassword",
	[string]$SclDatabase = "scl_institute",
	[string]$MoodleDumpPath = ""
)

$ErrorActionPreference = "Stop"

function Write-Step {
	param([string]$Message)
	Write-Host "[DEPLOY] $Message" -ForegroundColor Cyan
}

function Assert-Command {
	param([string]$Name)
	if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
		throw "Required command not found: $Name"
	}
}

function Invoke-Checked {
	param(
		[string]$File,
		[string[]]$Args,
		[string]$ErrorMessage
	)

	& $File @Args
	if ($LASTEXITCODE -ne 0) {
		throw $ErrorMessage
	}
}

function Invoke-Git {
	param([string[]]$GitArgs)
	& git -C $RepoPath @GitArgs
	if ($LASTEXITCODE -ne 0) {
		throw ('git command failed: git -C "{0}" {1}' -f $RepoPath, ($GitArgs -join ' '))
	}
}

function Upload-FileToRemote {
	param(
		[string]$LocalPath,
		[string]$RemoteSpec,
		[string]$ErrorMessage
	)

	$proc = Start-Process -FilePath "scp" -ArgumentList @($LocalPath, $RemoteSpec) -NoNewWindow -Wait -PassThru
	if ($proc.ExitCode -ne 0) {
		throw $ErrorMessage
	}
}

Write-Step "Validating prerequisites"
Assert-Command git
Assert-Command ssh

if ($SyncSclDb -or $SyncMoodleDb) {
	Assert-Command scp
}

if ($SyncSclDb) {
	Assert-Command docker
}

if (-not (Test-Path $RepoPath)) {
	throw "Repo path not found: $RepoPath"
}

Write-Step "Checking local branch"
$currentBranch = ((git -C $RepoPath rev-parse --abbrev-ref HEAD) | Out-String).Trim()
if ($currentBranch -ne "develop") {
	throw "Current branch is '$currentBranch'. Switch to 'develop' and retry."
}

Write-Step "Checking for uncommitted tracked changes"
$dirtyTracked = ((git -C $RepoPath status --porcelain --untracked-files=no) | Out-String).Trim()
if ($dirtyTracked) {
	throw "You have uncommitted tracked changes on develop. Commit/stash first."
}

# Ask operator about DB sync unless explicit flags were passed.
if (-not $NoDbPrompt -and -not $SyncSclDb -and -not $SyncMoodleDb) {
	Write-Host ""
	Write-Host "Database sync options:" -ForegroundColor Yellow
	$sclAnswer = (Read-Host "Sync SCL DB to production? (y/N)").Trim().ToLower()
	if ($sclAnswer -eq "y" -or $sclAnswer -eq "yes") {
		$SyncSclDb = $true
	}

	$moodleAnswer = (Read-Host "Sync Moodle DB to production? (y/N)").Trim().ToLower()
	if ($moodleAnswer -eq "y" -or $moodleAnswer -eq "yes") {
		$SyncMoodleDb = $true
	}
}

Write-Step "Fetching latest refs"
Invoke-Git @("fetch", "origin")

Write-Step "Pushing develop to production on GitHub"
Invoke-Git @("push", "origin", "develop:production")

Write-Step "Pulling production branch on remote server"
$remotePull = "cd $RemoteRepoPath && git fetch origin && git checkout production && git pull origin production"
ssh "$RemoteUser@$RemoteHost" $remotePull
if ($LASTEXITCODE -ne 0) {
	throw "Remote git update failed"
}

if (-not $SkipBuild) {
	Write-Step "Rebuilding and restarting production services"
	$remoteDeploy = "cd $RemoteRepoPath && docker compose -f $RemoteComposeFile up -d --build"
	ssh "$RemoteUser@$RemoteHost" $remoteDeploy
	if ($LASTEXITCODE -ne 0) {
		throw "Remote docker compose deploy failed"
	}
}

if ($SyncSclDb) {
	Write-Step "Syncing SCL DB (local Docker -> production Docker MySQL)"
	$ts = Get-Date -Format "yyyyMMdd_HHmmss"
	$sclDumpPath = Join-Path $env:TEMP ("scl_sync_{0}.sql" -f $ts)

	$sclDumpCmd = "docker exec $SclLocalMysqlContainer sh -lc `"mysqldump -u$SclLocalMysqlUser -p$SclLocalMysqlPassword --single-transaction --quick --routines --triggers $SclDatabase`" > `"$sclDumpPath`""
	cmd /c $sclDumpCmd | Out-Null
	if ($LASTEXITCODE -ne 0 -or -not (Test-Path $sclDumpPath)) {
		throw "Failed to export local SCL DB from container '$SclLocalMysqlContainer'"
	}

	Upload-FileToRemote -LocalPath $sclDumpPath -RemoteSpec ("{0}@{1}:/tmp/scl_sync.sql" -f $RemoteUser, $RemoteHost) -ErrorMessage "Failed to upload SCL DB dump"

	$rootPwd = ((ssh "$RemoteUser@$RemoteHost" "docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' scli-mysql-prod | grep '^MYSQL_ROOT_PASSWORD=' | cut -d= -f2") | Out-String).Trim()
	if ([string]::IsNullOrWhiteSpace($rootPwd)) {
		throw "Failed to detect MYSQL_ROOT_PASSWORD from scli-mysql-prod"
	}

	if ($rootPwd.Contains("'")) {
		throw "MYSQL_ROOT_PASSWORD contains a single quote, which this script currently does not support"
	}
	$pwdEscaped = $rootPwd
	$sclRemoteSql = "docker exec scli-mysql-prod mysql -uroot -p'$pwdEscaped' -e 'DROP DATABASE IF EXISTS $SclDatabase;'; " +
					"docker exec scli-mysql-prod mysql -uroot -p'$pwdEscaped' -e 'CREATE DATABASE $SclDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'; " +
					"docker exec -i scli-mysql-prod mysql -uroot -p'$pwdEscaped' $SclDatabase < /tmp/scl_sync.sql"
	ssh "$RemoteUser@$RemoteHost" $sclRemoteSql
	if ($LASTEXITCODE -ne 0) {
		throw "Failed to import SCL DB on production"
	}
}

if ($SyncMoodleDb) {
	Write-Step "Syncing Moodle DB (local dump -> production host MySQL)"
	if ([string]::IsNullOrWhiteSpace($MoodleDumpPath)) {
		$MoodleDumpPath = Join-Path $RepoPath "moodle-backup\moodle_backup.sql"
	}

	if (-not (Test-Path $MoodleDumpPath)) {
		throw "Moodle dump file not found: $MoodleDumpPath"
	}

	$remoteMoodleFile = if ($MoodleDumpPath.ToLower().EndsWith(".gz")) { "/tmp/moodle_sync.sql.gz" } else { "/tmp/moodle_sync.sql" }
	Upload-FileToRemote -LocalPath $MoodleDumpPath -RemoteSpec ("{0}@{1}:{2}" -f $RemoteUser, $RemoteHost, $remoteMoodleFile) -ErrorMessage "Failed to upload Moodle DB dump"

	$moodleRemoteSql = @"
mkdir -p /root/db-backups
mysqldump -u moodleuser -pmoodlepass moodle > /root/db-backups/moodle_before_sync_$(date +%Y%m%d_%H%M%S).sql
mysql -u moodleuser -pmoodlepass -e "DROP DATABASE IF EXISTS moodle; CREATE DATABASE moodle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"@

	if ($remoteMoodleFile.EndsWith(".gz")) {
		$moodleRemoteSql += "`ngunzip -c $remoteMoodleFile | mysql -u moodleuser -pmoodlepass moodle"
	} else {
		$moodleRemoteSql += "`nmysql -u moodleuser -pmoodlepass moodle < $remoteMoodleFile"
	}

	ssh "$RemoteUser@$RemoteHost" $moodleRemoteSql
	if ($LASTEXITCODE -ne 0) {
		throw "Failed to import Moodle DB on production"
	}
}

Write-Step "Running post-deploy health checks"
$healthCmd = "curl -s -o /dev/null -w 'frontend:%{http_code}\n' http://localhost/; " +
			 "curl -s -o /dev/null -w 'api:%{http_code}\n' http://localhost/api/health; " +
			 "curl -s -o /dev/null -w 'moodle:%{http_code}\n' http://localhost:8888/"
ssh "$RemoteUser@$RemoteHost" $healthCmd
if ($LASTEXITCODE -ne 0) {
	throw "Health check command failed"
}

Write-Step "Deployment workflow complete"
Write-Host "Done: develop -> production -> remote pull -> update" -ForegroundColor Green
if ($SyncSclDb -or $SyncMoodleDb) {
	Write-Host "DB sync completed:`n- SCL DB synced: $SyncSclDb`n- Moodle DB synced: $SyncMoodleDb" -ForegroundColor Green
}
