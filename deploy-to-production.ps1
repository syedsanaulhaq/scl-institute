param(
	[string]$RepoPath = "C:\SCL System\scl-institute",
	[string]$RemoteHost = "185.211.6.60",
	[string]$RemoteUser = "root",
	[string]$RemoteRepoPath = "/root/scl-institute",
	[string]$RemoteComposeFile = "docker-compose.prod.yml",
	[switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$canonicalScript = Join-Path $scriptDir "scripts\promote-develop-to-production.ps1"

if (-not (Test-Path $canonicalScript)) {
	throw "Canonical deployment script not found: $canonicalScript"
}

Write-Host "[DEPLOY] Using canonical workflow script: $canonicalScript" -ForegroundColor Cyan

& $canonicalScript `
	-RepoPath $RepoPath `
	-RemoteHost $RemoteHost `
	-RemoteUser $RemoteUser `
	-RemoteRepoPath $RemoteRepoPath `
	-RemoteComposeFile $RemoteComposeFile `
	-SkipBuild:$SkipBuild
