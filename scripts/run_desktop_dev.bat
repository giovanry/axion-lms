@echo off
title Olympus LMS - Desktop Dev Mode
cd /d "%~dp0\.."

echo [INFO] Menjalankan Olympus LMS Desktop (Mode Pengembangan)...
python scripts\desktop_launcher.py --dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Launcher Desktop Dev keluar dengan kode %errorlevel%.
    pause
)
