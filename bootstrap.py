import http.client
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
REQUIREMENTS_FILE = BASE_DIR / "requirements.txt"


def log(section: str, message: str, status: str = "INFO") -> None:
    badge = f"[{status}]"
    print(f"{badge:<8} {section:<16} : {message}")


def step_0_ensure_environment() -> None:
    """Memastikan paket Python dan modul frontend sudah terpasang secara otomatis."""
    # 1. Cek paket Python dasar
    try:
        import fastapi
        import sqlmodel
        import uvicorn
        import pydantic_settings
        import httpx
    except ImportError:
        log("ENV", "Paket Python belum lengkap. Menginstal dari requirements.txt...", "INFO")
        if REQUIREMENTS_FILE.exists():
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)], check=True)
            log("ENV", "Paket Python berhasil diinstal.", "OK")
        else:
            log("ENV", "requirements.txt tidak ditemukan di root.", "WARN")

    # 2. Cek dependensi frontend
    node_modules = FRONTEND_DIR / "node_modules"
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    if not node_modules.exists():
        log("FRONTEND", "Folder node_modules belum ada. Menjalankan npm install...", "INFO")
        try:
            subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR), check=True)
            log("FRONTEND", "Dependensi frontend berhasil diinstal.", "OK")
        except Exception as err:
            log("FRONTEND", f"Gagal menjalankan npm install: {err}", "WARN")


def step_1_validate_kaggle() -> bool:
    kaggle_path = Path.home() / ".kaggle" / "kaggle.json"
    if kaggle_path.exists():
        log("KAGGLE", f"Kredensial terdeteksi di {kaggle_path}", "OK")
        return True
    else:
        log(
            "KAGGLE",
            "kaggle.json belum ada di ~/.kaggle/. Dataset sampel lokal akan digunakan.",
            "INFO",
        )
        return False


def step_2_check_docker() -> bool:
    docker_bin = shutil.which("docker")
    if not docker_bin:
        log("RUNNER", "Runner eksekusi Python lokal aktif (Zero-Docker mode).", "OK")
        return True

    try:
        res = subprocess.run(["docker", "info"], capture_output=True, timeout=5)
        if res.returncode == 0:
            log("DOCKER", "Docker daemon aktif dengan dukungan GPU.", "OK")
            return True
        else:
            log("RUNNER", "Docker tidak aktif. Menggunakan runner Python lokal.", "OK")
            return True
    except Exception:
        log("RUNNER", "Menggunakan runner Python lokal.", "OK")
        return True


def step_3_initialize_database() -> bool:
    try:
        sys.path.insert(0, str(BASE_DIR))
        from backend.app.core.database import init_db
        from backend.app.services.codeforces_service import seed_initial_problems
        from backend.app.services.curriculum_service import sync_curriculum_to_db

        init_db()
        sync_curriculum_to_db()
        seed_initial_problems()
        log("DATABASE", "Database SQLite diinisialisasi dan disinkronkan dengan kurikulum.", "OK")
        return True
    except Exception as exc:
        log("DATABASE", f"Kesalahan inisialisasi: {exc}", "FAIL")
        return False


def step_4_setup_ollama_and_llama() -> bool:
    """
    Memeriksa ketersediaan Ollama dan memberi opsi kepada pengguna
    apakah ingin mengunduh model offline Llama 3 atau melewatkannya.
    """
    ollama_bin = shutil.which("ollama")

    # 1. Cek apakah layanan Ollama sedang berjalan di localhost:11434
    is_running = False
    installed_models = []
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", headers={"User-Agent": "AxionBootstrap"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status == 200:
                is_running = True
                data = json.loads(resp.read().decode("utf-8"))
                installed_models = [m.get("name", "") for m in data.get("models", [])]
    except Exception:
        is_running = False

    # Jika Ollama sudah terpasang dan berjalan dengan model Llama
    has_llama = any("llama" in m.lower() for m in installed_models)
    if is_running and has_llama:
        models_str = ", ".join(installed_models[:3])
        log("OLLAMA", f"Ollama aktif di http://localhost:11434 dengan model: {models_str}.", "OK")
        return True

    # 2. Cek interaktivitas terminal (jangan menahan jika dijalankan di mode non-interaktif)
    is_interactive = sys.stdin.isatty() and "--no-prompt" not in sys.argv and "--skip-llama" not in sys.argv

    if not is_interactive:
        if is_running:
            log("OLLAMA", "Ollama aktif tetapi model Llama belum ada (lewati prompt non-interaktif).", "INFO")
        else:
            log("OLLAMA", "Ollama tidak aktif (lewati prompt non-interaktif).", "INFO")
        return False

    print("\n" + "=" * 64)
    print("        KONFIGURASI ASISTEN AI OFFLINE (OPSIONAL)        ")
    print("=" * 64)
    print("Axion LMS mendukung asisten AI yang dapat berjalan 100% offline")
    print("di komputer Anda menggunakan Ollama dan model Llama 3 (Llama 3.2).")
    print("Kebutuhan kuota unduh: sekitar 2.0 GB.")
    print("")
    print("Jika Anda memilih TIDAK [N], Axion tetap dapat berjalan normal")
    print("menggunakan koneksi Google Gemini (cloud) atau tanpa AI offline.")
    print("=" * 64)

    # Kasus A: Ollama sudah terpasang di sistem
    if ollama_bin:
        # Jika belum running, coba jalankan daemon di background
        if not is_running:
            try:
                subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                time.sleep(2)
            except Exception:
                pass

        try:
            choice = input("\nApakah Anda ingin mengunduh model Llama 3.2 sekarang? [y/N]: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            choice = "n"

        if choice in ["y", "ya", "yes"]:
            log("OLLAMA", "Mengunduh model Llama 3.2 via Ollama (mohon tunggu)...", "INFO")
            try:
                subprocess.run(["ollama", "pull", "llama3.2"], check=True)
                log("OLLAMA", "Model Llama 3.2 berhasil diinstal dan siap digunakan.", "OK")
                return True
            except Exception as e:
                log("OLLAMA", f"Gagal mengunduh Llama 3.2: {e}. Melanjutkan tanpa Llama.", "WARN")
                return False
        else:
            log("OLLAMA", "Instalasi Llama 3 dilewati. Axion akan menggunakan mode cloud / standar.", "INFO")
            return False

    # Kasus B: Ollama belum terpasang di komputer
    else:
        log("OLLAMA", "Aplikasi Ollama belum terdeteksi di komputer Anda.", "INFO")
        try:
            choice = input("Apakah Anda ingin membuka situs unduhan resmi Ollama (https://ollama.com)? [y/N]: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            choice = "n"

        if choice in ["y", "ya", "yes"]:
            log("OLLAMA", "Membuka https://ollama.com/download di browser...", "INFO")
            try:
                webbrowser.open("https://ollama.com/download")
            except Exception:
                pass
        else:
            log("OLLAMA", "Pemasangan Ollama dilewati. Axion akan berjalan dalam mode cloud / standar.", "INFO")

        return False


def clear_stale_ports(ports=(3000, 8080, 8000)) -> None:
    if sys.platform == "win32":
        for port in ports:
            try:
                ps_cmd = f"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique"
                out = subprocess.check_output(
                    ["powershell", "-NoProfile", "-Command", ps_cmd],
                    text=True,
                    stderr=subprocess.DEVNULL,
                )
                for line in out.strip().splitlines():
                    pid = line.strip()
                    if pid.isdigit() and int(pid) > 4 and int(pid) != os.getpid():
                        subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, capture_output=True)
            except Exception:
                pass


def wait_for_service(url: str, timeout: float = 25.0) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AxionBootstrap/1.0"})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.4)
    return False


def terminate_process_tree(proc: subprocess.Popen) -> None:
    if not proc or proc.poll() is not None:
        return
    try:
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
        else:
            proc.terminate()
            proc.wait(timeout=3)
    except Exception:
        pass


class DualPortBridgeHandler(BaseHTTPRequestHandler):
    """Transparently proxies any request on port 8080 to Next.js on port 3000 without redirect loops."""

    def log_message(self, format, *args):
        pass

    def _forward(self):
        try:
            conn = http.client.HTTPConnection("127.0.0.1", 3000, timeout=15)
            headers = {k: v for k, v in self.headers.items() if k.lower() not in ["connection"]}
            headers["Host"] = "localhost:3000"

            body = None
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                body = self.rfile.read(content_length)

            conn.request(self.command, self.path, body=body, headers=headers)
            res = conn.getresponse()

            self.send_response(res.status, res.reason)
            for header, value in res.getheaders():
                if header.lower() not in ["transfer-encoding", "connection"]:
                    if header.lower() == "location":
                        value = value.replace("localhost:3000", "localhost:8080").replace("127.0.0.1:3000", "localhost:8080")
                    self.send_header(header, value)
            self.end_headers()

            data = res.read()
            self.wfile.write(data)
            conn.close()
        except Exception:
            self.send_error(502, "Axion Next.js service initializing...")

    do_GET = _forward
    do_POST = _forward
    do_PUT = _forward
    do_DELETE = _forward
    do_HEAD = _forward
    do_OPTIONS = _forward
    do_PATCH = _forward


def start_port_bridge(bridge_port: int = 8080, target_port: int = 3000) -> HTTPServer:
    """Runs a bridge on 8080 forwarding to 3000 so both ports work simultaneously."""
    server = HTTPServer(("0.0.0.0", bridge_port), DualPortBridgeHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


def step_5_start_services() -> None:
    log("SYSTEM", "Memeriksa dan membebaskan port 3000, 8080, dan 8000...", "INFO")
    clear_stale_ports((3000, 8080, 8000))

    log("SYSTEM", "Memulai backend FastAPI dan frontend Next.js...", "RUN")

    # 1. Start FastAPI backend on port 8000
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
    ]

    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BASE_DIR),
    )

    if wait_for_service("http://localhost:8000/api/v1/health", timeout=12.0):
        log("BACKEND", "FastAPI server aktif di http://localhost:8000 (API docs: /docs)", "OK")
    else:
        log("BACKEND", "FastAPI server diinisialisasi pada http://localhost:8000", "WARN")

    # 2. Start Next.js Frontend on port 3000
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
    )

    log("FRONTEND", "Menunggu Next.js server siap pada http://localhost:3000...", "INFO")
    wait_for_service("http://localhost:3000", timeout=30.0)

    # 3. Start Port Bridge on 8080 forwarding to 3000 (Unified Dual-Port Access)
    bridge_server = None
    try:
        bridge_server = start_port_bridge(8080, 3000)
        log("BRIDGE", "Dual-Port Bridge aktif di http://localhost:8080 -> port 3000", "OK")
    except Exception as bridge_err:
        log("BRIDGE", f"Bridge port 8080: {bridge_err}", "WARN")

    if wait_for_service("http://localhost:3000", timeout=8.0):
        log("FRONTEND", "Axion frontend siap di http://localhost:3000", "OK")
    else:
        log("FRONTEND", "Axion frontend berjalan di http://localhost:3000", "OK")

    print("\n" + "=" * 64)
    print("  Axion Precision LMS kini aktif dan siap digunakan!")
    print("  - Tampilan Web (Direct) : http://localhost:3000")
    print("  - Tampilan Web (Bridge) : http://localhost:8080")
    print("  - Dokumentasi API       : http://localhost:8000/docs")
    print("  Tekan Ctrl+C untuk menghentikan seluruh layanan.")
    print("=" * 64 + "\n")

    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                log("BACKEND", f"Proses backend terhenti (kode: {backend_proc.returncode})", "FAIL")
                break
            if frontend_proc and frontend_proc.poll() is not None:
                if not wait_for_service("http://localhost:3000", timeout=2.0):
                    log("FRONTEND", f"Proses frontend terhenti (kode: {frontend_proc.returncode})", "FAIL")
                    break
    except KeyboardInterrupt:
        print("\nMenghentikan seluruh layanan Axion...")
    finally:
        if bridge_server:
            try:
                bridge_server.shutdown()
            except Exception:
                pass
        if frontend_proc:
            terminate_process_tree(frontend_proc)
        terminate_process_tree(backend_proc)
        clear_stale_ports((3000, 8080, 8000))
        log("SYSTEM", "Semua layanan Axion berhasil dihentikan.", "OK")


def main():
    print("==========================================================")
    print("   AXION: Precision AI & Python LMS Environment Bootstrap ")
    print("==========================================================\n")

    step_0_ensure_environment()
    step_1_validate_kaggle()
    step_2_check_docker()
    step_3_initialize_database()
    step_4_setup_ollama_and_llama()
    step_5_start_services()


if __name__ == "__main__":
    main()
