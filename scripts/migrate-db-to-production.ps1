# Migrates local petrotimes_dev DATA into the production (cloud) database.
# Prerequisite: run `npx prisma migrate deploy` against the cloud DB first
# (with DATABASE_URL pointing to the cloud), so the schema exists there.
#
# Usage:
#   .\scripts\migrate-db-to-production.ps1 -TargetUrl "postgresql://user:pass@host/db?sslmode=require"

param(
  [Parameter(Mandatory = $true)]
  [string]$TargetUrl
)

$ErrorActionPreference = "Stop"
$bin = "C:\Program Files\PostgreSQL\16\bin"
$dump = Join-Path $PSScriptRoot "petrotimes-dev-backup.dump"

# read local credentials from .env (never hardcode them here)
$envContent = Get-Content (Join-Path $PSScriptRoot "..\.env") -Raw
if ($envContent -notmatch 'postgresql://([^:]+):([^@"]+)@([^:"/]+):?(\d*)/([^"?]+)') {
  throw "Could not parse DATABASE_URL from .env"
}
$localUser = $Matches[1]
$localPass = $Matches[2]
$localHost = $Matches[3]
$localDb   = $Matches[5]

Write-Host "1/2 Dumping local $localDb (data only)..."
$env:PGPASSWORD = $localPass
& "$bin\pg_dump.exe" --data-only --format=custom --no-owner --no-privileges `
  -U $localUser -h $localHost -d $localDb -f $dump
if ($LASTEXITCODE -ne 0) { $env:PGPASSWORD = $null; throw "pg_dump failed" }

Write-Host "2/2 Restoring into production database..."
& "$bin\pg_restore.exe" --data-only --no-owner --no-privileges --exit-on-error `
  -d $TargetUrl $dump
$env:PGPASSWORD = $null
if ($LASTEXITCODE -ne 0) { throw "pg_restore failed" }

Remove-Item $dump -Force
Write-Host "Done - local data is now in production."
