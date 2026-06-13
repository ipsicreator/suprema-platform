$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.Encoding]::UTF8

$progId = 'HWPFrame.HwpObject'
Write-Host "STEP=attach"
$hwp = [Runtime.InteropServices.Marshal]::GetActiveObject($progId)
Write-Host "STEP=attached"
Write-Output $hwp.GetType().FullName
