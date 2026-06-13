$ErrorActionPreference = 'Stop'

$hwpPath = $args[0]
if (-not $hwpPath) {
    throw "Missing HWP path"
}

$OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "PATH=$hwpPath"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

$hwp = $null
Write-Host "STEP=create"
$hwp = New-Object -ComObject HWPFrame.HwpObject
Write-Host "STEP=register"
$null = $hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule")
Write-Host "STEP=open"
$opened = $hwp.Open($hwpPath, "", "forceopen:True;suspendpassword:True;versionwarning:False")
if (-not $opened) {
    throw "Open failed: $hwpPath"
}

Write-Host "STEP=gettext"
$text = $hwp.GetTextFile("TEXT", "")
if ($text -is [array]) {
    $text = ($text -join "")
}

Write-Host "STEP=done elapsed=$($sw.Elapsed.TotalSeconds)"
Write-Output $text
