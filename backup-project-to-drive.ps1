param(
    [Parameter(Mandatory=$true)]
    [string]$BackupRoot,

    [switch]$Mirror,

    [switch]$IncludeNodeModules
)

$ErrorActionPreference = 'Stop'

$Source = "C:\SCL System\scl-institute"
$Destination = Join-Path $BackupRoot "scl-institute"

if (-not (Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

$excludeDirs = @("dist", "build", ".vite", ".next", ".cache")
if (-not $IncludeNodeModules) {
    $excludeDirs += "node_modules"
}

$baseArgs = @(
    "`"$Source`"",
    "`"$Destination`"",
    "/R:1",
    "/W:1",
    "/Z",
    "/FFT",
    "/XJ",
    "/NP",
    "/NFL",
    "/NDL"
)

if ($Mirror) {
    $baseArgs += "/MIR"
} else {
    $baseArgs += "/E"
}

if ($excludeDirs.Count -gt 0) {
    $baseArgs += "/XD"
    $baseArgs += $excludeDirs
}

Write-Host "Source      : $Source"
Write-Host "Destination : $Destination"
Write-Host "Mode        : " + ($(if ($Mirror) { "Mirror (/MIR)" } else { "Copy (/E)" }))
Write-Host "Excluding   : $($excludeDirs -join ', ')"

$cmd = "robocopy " + ($baseArgs -join " ")
Write-Host "Running: $cmd"

Invoke-Expression $cmd
$rc = $LASTEXITCODE

# Robocopy exit codes 0-7 are success/warning; 8+ indicates failure.
if ($rc -ge 8) {
    throw "Backup failed. Robocopy exit code: $rc"
}

Write-Host "Backup completed. Robocopy exit code: $rc"
Write-Host "Latest commit in backup:"

if (Test-Path (Join-Path $Destination ".git")) {
    git -C $Destination log -1 --oneline
} else {
    Write-Host "No .git folder found in backup destination."
}
