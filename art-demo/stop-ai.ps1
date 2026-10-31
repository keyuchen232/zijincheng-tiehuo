$pidFile = Join-Path $PSScriptRoot '.server.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { exit }
$serverProcessId = [int](Get-Content -LiteralPath $pidFile)
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$serverProcessId" -ErrorAction SilentlyContinue
$serverPath = Join-Path $PSScriptRoot 'serve_ai.py'
if ($processInfo -and $processInfo.CommandLine -and $processInfo.CommandLine.Contains($serverPath)) { Stop-Process -Id $serverProcessId }
Remove-Item -LiteralPath $pidFile
