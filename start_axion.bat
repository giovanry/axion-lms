@echo off
setlocal enabledelayedexpansion
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
    echo Silakan unduh dan instal Python 3.10+ dari: https://www.python.org/downloads/
    echo PENTING: Pastikan opsi "Add Python to PATH" dicentang saat instalasi!
    echo.
    pause
    exit /b 1
)

:: 2. Verifikasi instalasi Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak terdeteksi di PATH sistem Anda.
    echo Silakan unduh dan instal Node.js LTS dari: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 3. Verifikasi paket Python (FastAPI, SQLModel, Uvicorn, dll)
python -c "import fastapi, sqlmodel, uvicorn, pydantic, httpx" >nul 2>&1
if %errorlevel% neq 0 (
    echo [STATUS] Dependensi Python belum lengkap.
    echo [STATUS] Menginstal paket yang dibutuhkan dari requirements.txt...
    echo.
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal menginstal dependensi Python via pip.
        echo Periksa koneksi internet Anda atau jalankan manual: pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
    echo [OK] Dependensi Python berhasil diinstal.
    echo.
)

:: 4. Verifikasi modul Frontend (node_modules)
if not exist "frontend\node_modules\" (
    echo [STATUS] Folder frontend\node_modules belum ditemukan.
    echo [STATUS] Menginstal dependensi frontend via npm install...
    echo.
    cd frontend
    call npm install
    cd ..
    echo [OK] Dependensi frontend berhasil diinstal.
    echo.
)

echo [OK] Seluruh prasyarat dasar terverifikasi.
echo [STATUS] Menjalankan Axion Bootstrap Orchestrator...
echo.

:: 5. Jalankan bootstrap orchestrator
python bootstrap.py %*

if %errorlevel% neq 0 (
    echo.
    echo [INFO] Layanan Axion telah dihentikan (kode exit: %errorlevel%).
)

echo.
echo Terima kasih telah menggunakan Axion LMS.
pause
