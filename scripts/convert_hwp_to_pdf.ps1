$ErrorActionPreference = 'Stop'

$inputPath = $args[0]
$outputPath = $args[1]

if (-not $inputPath) { throw "Missing input path" }
if (-not $outputPath) { throw "Missing output path" }

$outputDir = Split-Path -Parent $outputPath
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$hwp = New-Object -ComObject HWPFrame.HwpObject
$null = $hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule")

$opened = $hwp.Open($inputPath, "", "forceopen:True;suspendpassword:True;versionwarning:False")
if (-not $opened) {
    throw "Open failed: $inputPath"
}

if (Test-Path $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
}

$saved = $hwp.SaveAs($outputPath, "PDF", "")
if (-not $saved) {
    throw "SaveAs failed: $inputPath"
}

$hwp.Quit()
