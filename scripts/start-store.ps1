[CmdletBinding()]
param(
    [ValidateSet('Start', 'Stop', 'Status')]
    [string]$Action = 'Start',
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runtimeDir = Join-Path $projectRoot '.store-runtime'
$stateFile = Join-Path $runtimeDir 'processes.json'
$frontUrl = 'http://localhost:8080'
$apiUrl = 'http://localhost:3000/api/health'

function Read-StoreState {
    if (-not (Test-Path $stateFile)) {
        return $null
    }

    try {
        return Get-Content -Raw $stateFile | ConvertFrom-Json
    }
    catch {
        Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
        return $null
    }
}

function Get-RecordedProcess {
    param($Record)

    if (-not $Record) {
        return $null
    }

    try {
        $process = Get-Process -Id ([int]$Record.pid) -ErrorAction Stop
        $savedStart = [DateTime]::Parse([string]$Record.startedAt).ToUniversalTime()
        $actualStart = $process.StartTime.ToUniversalTime()

        if ([Math]::Abs(($savedStart - $actualStart).TotalSeconds) -le 3) {
            return $process
        }
    }
    catch {
        return $null
    }

    return $null
}

function Test-LocalPort {
    param([int]$Port)

    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $result = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        return $result.AsyncWaitHandle.WaitOne(350) -and $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

function Test-DockerDaemon {
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        return $false
    }

    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'SilentlyContinue'
        & $docker.Source info *> $null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Start-ProjectPostgres {
    if (Test-LocalPort 5432) {
        return $false
    }

    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        return $false
    }

    if (-not (Test-DockerDaemon)) {
        return $false
    }

    Write-Host 'Starting the project PostgreSQL container...'
    $composeLog = Join-Path $runtimeDir 'postgres.log'
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'SilentlyContinue'
        & $docker.Source compose `
            -f (Join-Path $projectRoot 'compose.yaml') `
            up -d postgres *> $composeLog
        $composeExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($composeExitCode -ne 0) {
        Write-Warning "PostgreSQL container startup failed. Check $composeLog"
        return $false
    }

    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if (Test-LocalPort 5432) {
            return $true
        }
        Start-Sleep -Seconds 1
    }

    Write-Warning 'PostgreSQL did not become ready on port 5432.'
    return $true
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$Attempts = 20
    )

    for ($attempt = 0; $attempt -lt $Attempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
            Start-Sleep -Milliseconds 300
        }
    }

    return $false
}

function New-ProcessRecord {
    param(
        [string]$Role,
        [System.Diagnostics.Process]$Process
    )

    return [PSCustomObject]@{
        role = $Role
        pid = $Process.Id
        startedAt = $Process.StartTime.ToUniversalTime().ToString('o')
    }
}

function Start-NodeService {
    param(
        [string]$Role,
        [string]$ScriptPath
    )

    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        throw 'Node.js was not found. Install Node.js 18 or newer first.'
    }

    $stdout = Join-Path $runtimeDir "$Role.log"
    $stderr = Join-Path $runtimeDir "$Role.err.log"

    return Start-Process `
        -FilePath $node.Source `
        -ArgumentList @($ScriptPath) `
        -WorkingDirectory $projectRoot `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -WindowStyle Hidden `
        -PassThru
}

function Save-StoreState {
    param(
        [array]$Records,
        [bool]$DatabaseManaged = $false
    )

    [PSCustomObject]@{
        project = $projectRoot
        updatedAt = (Get-Date).ToUniversalTime().ToString('o')
        databaseManaged = $DatabaseManaged
        processes = $Records
    } | ConvertTo-Json -Depth 4 | Set-Content -Path $stateFile -Encoding UTF8
}

function Stop-Store {
    $state = Read-StoreState
    if (-not $state) {
        Write-Host 'Store is already stopped.'
        return
    }

    $stopped = 0
    foreach ($record in @($state.processes)) {
        $process = Get-RecordedProcess $record
        if ($process) {
            Stop-Process -Id $process.Id -Force
            $stopped++
            Write-Host "Stopped $($record.role) (PID $($process.Id))."
        }
    }

    if ($state.databaseManaged) {
        $docker = Get-Command docker -ErrorAction SilentlyContinue
        if ($docker -and (Test-DockerDaemon)) {
            $previousPreference = $ErrorActionPreference
            try {
                $ErrorActionPreference = 'SilentlyContinue'
                & $docker.Source compose `
                    -f (Join-Path $projectRoot 'compose.yaml') `
                    stop postgres *> $null
                $composeExitCode = $LASTEXITCODE
            }
            finally {
                $ErrorActionPreference = $previousPreference
            }

            if ($composeExitCode -eq 0) {
                Write-Host 'Stopped project PostgreSQL container.'
            }
        }
    }

    Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
    if ($stopped -eq 0) {
        Write-Host 'No running store processes were found.'
    }
}

function Show-Status {
    $state = Read-StoreState
    if (-not $state) {
        Write-Host 'Store status: stopped'
        return
    }

    $running = 0
    foreach ($record in @($state.processes)) {
        $process = Get-RecordedProcess $record
        if ($process) {
            Write-Host "$($record.role): running (PID $($process.Id))"
            $running++
        }
    }

    if ($running -eq 0) {
        Write-Host 'Store status: stopped (stale state removed)'
        Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
    }
}

if ($Action -eq 'Stop') {
    Stop-Store
    exit 0
}

if ($Action -eq 'Status') {
    Show-Status
    exit 0
}

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null

$records = @()
$existingState = Read-StoreState
$databaseManaged = [bool]($existingState -and $existingState.databaseManaged)
if ($existingState) {
    foreach ($record in @($existingState.processes)) {
        if (Get-RecordedProcess $record) {
            $records += $record
        }
    }
}

$frontendRecord = $records | Where-Object { $_.role -eq 'frontend' } | Select-Object -First 1
if (-not $frontendRecord) {
    if (Test-LocalPort 8080) {
        throw 'Port 8080 is already in use. Close that service and run this script again.'
    }

    $frontend = Start-NodeService -Role 'frontend' -ScriptPath (Join-Path $projectRoot 'server\static-server.js')
    $frontendRecord = New-ProcessRecord -Role 'frontend' -Process $frontend
    $records += $frontendRecord
    Save-StoreState -Records $records -DatabaseManaged $databaseManaged
}

if (-not (Wait-ForUrl -Url $frontUrl)) {
    Stop-Store
    throw "Frontend failed to start. Check $runtimeDir\frontend.err.log"
}

$apiRecord = $records | Where-Object { $_.role -eq 'api' } | Select-Object -First 1
if (-not $apiRecord) {
    if (-not (Test-LocalPort 5432)) {
        $databaseManaged = Start-ProjectPostgres
    }

    if (Test-LocalPort 3000) {
        Write-Host 'Port 3000 is already in use; the existing API was left untouched.'
    }
    elseif (-not (Test-LocalPort 5432)) {
        Write-Host 'PostgreSQL is not running; start it or Docker Desktop to enable the API.'
        Write-Host 'The storefront will continue with browser-local cart and order data.'
    }
    else {
        if (-not (Test-Path (Join-Path $projectRoot 'node_modules\pg'))) {
            $npm = Get-Command npm -ErrorAction SilentlyContinue
            if (-not $npm) {
                Write-Warning 'npm was not found, so the optional API was not started.'
            }
            else {
                Write-Host 'Installing API dependencies...'
                Push-Location $projectRoot
                try {
                    & $npm.Source install --no-audit --no-fund
                }
                finally {
                    Pop-Location
                }
            }
        }

        if (Test-Path (Join-Path $projectRoot 'node_modules\pg')) {
            $api = Start-NodeService -Role 'api' -ScriptPath (Join-Path $projectRoot 'server\server.js')
            if (Wait-ForUrl -Url $apiUrl -Attempts 30) {
                $records += New-ProcessRecord -Role 'api' -Process $api
                Save-StoreState -Records $records -DatabaseManaged $databaseManaged
            }
            else {
                Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
                Write-Warning "API failed to start. Check $runtimeDir\api.err.log"
            }
        }
    }
}

Save-StoreState -Records $records -DatabaseManaged $databaseManaged
Write-Host "Storefront: $frontUrl"
if ($records | Where-Object { $_.role -eq 'api' }) {
    Write-Host "API health: $apiUrl"
}

if (-not $NoBrowser) {
    Start-Process $frontUrl
}
