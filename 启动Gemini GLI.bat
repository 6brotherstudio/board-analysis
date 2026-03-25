@echo off
TITLE Gemini CLI Launcher

:: 设置你的 Google Cloud 项目 ID
set GOOGLE_CLOUD_PROJECT=intrepid-broker-475009-u6

:: 设置代理服务器地址
set http_proxy=http://127.0.0.1:10871
set https_proxy=http://127.0.0.1:10871

echo [INFO] 正在设置环境变量并启动 Gemini CLI...
echo [INFO] Project: %GOOGLE_CLOUD_PROJECT%
echo [INFO] Proxy: %http_proxy%
echo.

:: 启动 Gemini CLI
gemini