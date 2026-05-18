# PocketBase Linux Binary Preparation Script for Fly.io
$PB_VERSION = "0.22.13" # 최신 안정 버전
$URL = "https://github.com/pocketbase/pocketbase/releases/download/v$PB_VERSION/pocketbase_${PB_VERSION}_linux_amd64.zip"
$DEST_DIR = "fly/pocketbase"
$ZIP_PATH = "$DEST_DIR/pocketbase_linux.zip"

if (!(Test-Path $DEST_DIR)) {
    New-Item -ItemType Directory -Path $DEST_DIR
}

Write-Host "Downloading PocketBase v$PB_VERSION for Linux (amd64)..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $URL -OutFile $ZIP_PATH

Write-Host "Extracting binary..." -ForegroundColor Cyan
Expand-Archive -Path $ZIP_PATH -DestinationPath $DEST_DIR -Force

# 불필요한 파일 삭제
Remove-Item $ZIP_PATH
if (Test-Path "$DEST_DIR/CHANGELOG.md") { Remove-Item "$DEST_DIR/CHANGELOG.md" }
if (Test-Path "$DEST_DIR/LICENSE.md") { Remove-Item "$DEST_DIR/LICENSE.md" }

Write-Host "Success! Linux binary is ready at $DEST_DIR/pocketbase" -ForegroundColor Green
Write-Host "Now you can run: fly deploy --config fly/pocketbase/fly.toml" -ForegroundColor Yellow
