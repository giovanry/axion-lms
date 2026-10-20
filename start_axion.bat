@echo off
setlocal
cd /d "%~dp0"
title Axion LMS - Precision AI and Python Learning System

echo ===================================================================
echo               AXION LMS - PRECISION AI LEARNING SYSTEM             
echo ===================================================================
echo [STATUS] Memeriksa dependensi sistem...
echo.

:: 1. Verifikasi instalasi Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak terdeteksi di PATH sistem Anda.
    echo Silakan instal Python 3.10+ dari https://www.python.org/
    echo Pastikan opsi 'Add Python to PATH' telah dicentang saat instalasi.
    echo.
    pause
    exit /b 1
)

:: 2. Verifikasi instalasi Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak terdeteksi di PATH sistem Anda.
    echo Silakan instal Node.js LTS dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Python dan Node.js terdeteksi.
echo [STATUS] Memulai backend FastAPI (port 8000) dan frontend Next.js (port 3000 ^& 8080)...
echo [STATUS] Browser akan terbuka otomatis setelah server siap...
echo.

:: 3. Jalankan bootstrap orchestrator
python bootstrap.py %*

if %errorlevel% neq 0 (
    echo.
    echo [INFO] Layanan Axion telah dihentikan (kode exit: %errorlevel%).
)

echo.
echo Terima kasih telah menggunakan Axion LMS.
pause
