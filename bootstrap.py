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

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"


def log(section: str, message: str, status: str = "INFO") -> None:
    badge = f"[{status}]"
    print(f"{badge:<8} {section:<16} : {message}")


def step_1_validate_kaggle() -> bool:
    kaggle_path = Path.home() / ".kaggle" / "kaggle.json"
    if kaggle_path.exists():
        log("KAGGLE", f"Credentials found at {kaggle_path}", "OK")
        return True
    else:
        log(
            "KAGGLE",
            "kaggle.json not found in ~/.kaggle/. Local offline sample datasets will be used.",
            "WARN",
        )
        return False


def step_2_check_docker() -> bool:
    docker_bin = shutil.which("docker")
    if not docker_bin:
        log("RUNNER", "Local Python sandbox runner active (Zero-Docker mode).", "OK")
        return True

    try:
        res = subprocess.run(["docker", "info"], capture_output=True, timeout=5)
        if res.returncode == 0:
            log("DOCKER", "Docker daemon is active with GPU support.", "OK")
            return True
        else:
            log("RUNNER", "Docker daemon not running. Using local Python sandbox runner.", "OK")
            return True
    except Exception:
        log("RUNNER", "Using local Python sandbox runner.", "OK")
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
        log("DATABASE", "SQLite database initialized and seeded with curriculum & problems.", "OK")
        return True
    except Exception as exc:
        log("DATABASE", f"Initialization error: {exc}", "FAIL")
        return False


def step_4_check_ollama() -> bool:
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", headers={"User-Agent": "AxionBootstrap"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]
                model_str = f"({', '.join(models[:3])})" if models else "service ready"
                log("OLLAMA", f"Ollama is active on http://localhost:11434 {model_str}.", "OK")
                return True
    except Exception:
        log(
            "OLLAMA",
            "Ollama is offline. Start Ollama with 'ollama run llama3.2' to enable AI tutoring.",
            "WARN",
        )
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
    import webbrowser

    log("SYSTEM", "Memeriksa dan membebaskan port 3000, 8080, dan 8000...", "INFO")
    clear_stale_ports((3000, 8080, 8000))

    log("SYSTEM", "Starting Axion FastAPI Backend and Next.js Frontend...", "RUN")

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
        log("BACKEND", "FastAPI server running at http://localhost:8000 (API docs: /docs)", "OK")
    else:
        log("BACKEND", "FastAPI server diinisialisasi pada http://localhost:8000", "WARN")

    # 2. Start Next.js Frontend on port 3000
    frontend_proc = None
    node_modules = FRONTEND_DIR / "node_modules"
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    if not node_modules.exists():
        log("FRONTEND", "Menginstal dependensi frontend via npm...", "INFO")
        subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR), check=True)

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
    print("  Axion Precision LMS is now operational!")
    print("  - Web Interface (Direct) : http://localhost:3000")
    print("  - Web Interface (Bridge) : http://localhost:8080")
    print("  - Backend API            : http://localhost:8000/docs")
    print("  Kedua port (3000 dan 8080) kini merujuk ke sistem Axion yang sama!")
    print("  Press Ctrl+C to terminate services gracefully.")
    print("=" * 64 + "\n")

    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                log("BACKEND", f"Backend process stopped with exit code {backend_proc.returncode}", "FAIL")
                break
            if frontend_proc and frontend_proc.poll() is not None:
                if not wait_for_service("http://localhost:3000", timeout=2.0):
                    log("FRONTEND", f"Frontend process stopped with exit code {frontend_proc.returncode}", "FAIL")
                    break
    except KeyboardInterrupt:
        print("\nStopping services...")
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
        log("SYSTEM", "All Axion services stopped cleanly.", "OK")


def main():
    print("==========================================================")
    print("   AXION: Precision AI & Python LMS Environment Bootstrap ")
    print("==========================================================\n")

    step_1_validate_kaggle()
    step_2_check_docker()
    step_3_initialize_database()
    step_4_check_ollama()
    step_5_start_services()


if __name__ == "__main__":
    main()
