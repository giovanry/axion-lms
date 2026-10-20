@echo off
title Olympus LMS - Build Native Windows App
cd /d "%~dp0\.."

echo ==========================================================
echo   OLYMPUS LMS: Native Windows Application Builder
echo ==========================================================
echo.

:: 1. Verifikasi Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak ditemukan di PATH.
    pause
    exit /b 1
)

:: 2. Generate Desktop Icons
echo [1/3] Memeriksa dan membuat ikon desktop Olympus...
python scripts\generate_icons.py

:: 3. Export Frontend Next.js Statis
echo.
echo [2/3] Mengompilasi dan mengekspor frontend Next.js (Static Export)...
cd frontend
set TAURI_BUILD=true
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengekspor frontend Next.js!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Memeriksa compiler Rust (Cargo/Tauri)...
where cargo >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ------------------------------------------------------------------
    echo [INFO] Compiler Rust (cargo) belum terpasang di sistem.
    echo.
    echo Anda dapat:
    echo 1. Menjalankan aplikasi langsung dengan launcher desktop bawaan:
    echo    start_desktop.bat
    echo.
    echo 2. Memasang Rust untuk mengompilasi biner .exe mandiri via:
    echo    winget install --id Rustlang.Rustup -e
    echo ------------------------------------------------------------------
    echo.
    pause
    exit /b 0
)

echo [INFO] Menjalankan Cargo Tauri Build...
cd src-tauri
cargo tauri build
if %errorlevel% neq 0 (
    echo [ERROR] Kompilasi Tauri gagal.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ==========================================================
echo   BUILD SELESAI: File installer / binary tersedia di:
echo   src-tauri\target\release\
echo ==========================================================
pause
