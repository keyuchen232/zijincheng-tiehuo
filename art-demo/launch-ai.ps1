param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$address = 'http://127.0.0.1:8319'
try {
    $status = $null
    try { $status = Invoke-RestMethod "$address/api/status" -TimeoutSec 2 } catch { }
    if ($status) {
        if (($status.mode -ne 'image-edit' -or $status.version -ne 'art.1')) { throw 'Port 8319 belongs to another service.' }
        if (-not $NoBrowser) { Start-Process $address }
        exit
    }
    $pythonCandidates = @(
        $env:WANXIANG_PYTHON,
        (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe')
    )
    $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($pythonCommand) { $pythonCandidates += $pythonCommand.Source }
    $pythonPath = $pythonCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) -and $_ -notmatch 'WindowsApps' } | Select-Object -First 1
    if (-not $pythonPath) { throw 'Python 3.11+ is required. Set WANXIANG_PYTHON to python.exe; see README.md.' }
    $process = Start-Process -FilePath $pythonPath -ArgumentList @('"' + (Join-Path $PSScriptRoot 'serve_ai.py') + '"') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $PSScriptRoot '.server.log') -RedirectStandardError (Join-Path $PSScriptRoot '.server-error.log')
    [IO.File]::WriteAllText((Join-Path $PSScriptRoot '.server.pid'), [string]$process.Id)
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try { $status = Invoke-RestMethod "$address/api/status" -TimeoutSec 1; if (($status.mode -eq 'image-edit' -and $status.version -eq 'art.1')) { $ready = $true; break } } catch { }
        if ($process.HasExited) { break }
        Start-Sleep -Milliseconds 200
    }
    if (-not $ready) { throw 'Could not start local image service. See .server-error.log and README.md.' }
    if (-not $NoBrowser) { Start-Process $address }
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Wanxiang AI startup') | Out-Null
}
