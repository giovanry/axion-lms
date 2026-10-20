#!/usr/bin/env bash
# ===================================================================
#               AXION LMS - PRECISION AI LEARNING SYSTEM             
# ===================================================================

set -e
cd "$(dirname "$0")"

echo "==================================================================="
echo "              AXION LMS - PRECISION AI LEARNING SYSTEM             "
echo "==================================================================="
echo "[STATUS] Memeriksa dependensi sistem..."
echo ""

# 1. Verifikasi instalasi Python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python tidak terdeteksi di sistem Anda."
    echo "Silakan instal Python 3.10+ dari: https://www.python.org/downloads/"
    exit 1
fi

# 2. Verifikasi instalasi Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js tidak terdeteksi di sistem Anda."
    echo "Silakan instal Node.js LTS dari: https://nodejs.org/"
    exit 1
fi

# 3. Verifikasi paket Python
if ! $PYTHON_CMD -c "import fastapi, sqlmodel, uvicorn, pydantic, httpx" >/dev/null 2>&1; then
    echo "[STATUS] Dependensi Python belum lengkap."
    echo "[STATUS] Menginstal paket dari requirements.txt..."
    $PYTHON_CMD -m pip install -r requirements.txt
    echo "[OK] Dependensi Python berhasil diinstal."
    echo ""
fi

# 4. Verifikasi modul Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "[STATUS] Menginstal dependensi frontend via npm install..."
    (cd frontend && npm install)
    echo "[OK] Dependensi frontend berhasil diinstal."
    echo ""
fi

echo "[OK] Seluruh prasyarat dasar terverifikasi."
echo "[STATUS] Menjalankan Axion Bootstrap Orchestrator..."
echo ""

exec $PYTHON_CMD bootstrap.py "$@"
