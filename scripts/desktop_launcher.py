"""
Olympus LMS - Native Windows Desktop Launcher
Runs backend service (FastAPI) and frontend UI using the PC's built-in Python and Windows native WebView2/Edge runtime.
"""

import os
import sys
import time
import socket
import argparse
import subprocess
import threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import urllib.request
import json

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_OUT = FRONTEND_DIR / "out"
DATA_DIR = ROOT_DIR / "data"

class DualStackServer(ThreadingHTTPServer):
    """Server that listens on both IPv6 (::1) and IPv4 (127.0.0.1) loopback addresses."""
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception:
            pass
        return super().server_bind()


class StandaloneStaticHandler(SimpleHTTPRequestHandler):
    """Serves static Next.js export with HTML fallback for client-side routing, and proxies /api/* to FastAPI."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_OUT), **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logging in console
        pass

    def _proxy_to_backend(self):
        backend_url = f"http://127.0.0.1:8000{self.path}"
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            # Filter hop-by-hop and connection headers
            skip_headers = {"host", "content-length", "connection", "accept-encoding"}
            headers = {k: v for k, v in self.headers.items() if k.lower() not in skip_headers}
            req = urllib.request.Request(backend_url, data=body, headers=headers, method=self.command)

            with urllib.request.urlopen(req, timeout=60.0) as resp:
                status = resp.status
                resp_headers = resp.getheaders()
                content_type = resp.headers.get("Content-Type", "")
                is_stream = "text/event-stream" in content_type

                self.send_response(status)
                for header, val in resp_headers:
                    if header.lower() not in ["transfer-encoding", "content-length", "connection"]:
                        self.send_header(header, val)

                if is_stream:
                    # Stream tokens in real-time for Server-Sent Events (SSE)
                    self.send_header("Connection", "close")
                    self.end_headers()
                    while True:
                        chunk = resp.read(256)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        self.wfile.flush()
                else:
                    data = resp.read()
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err_data = e.read()
            self.send_response(e.code)
            for header, val in e.headers.items():
                if header.lower() not in ["transfer-encoding", "content-length"]:
                    self.send_header(header, val)
            self.send_header("Content-Length", str(len(err_data)))
            self.end_headers()
            self.wfile.write(err_data)
        except Exception as e:
            err_json = json.dumps({"error": f"Backend unreachable: {e}"}).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(err_json)))
            self.end_headers()
            self.wfile.write(err_json)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy_to_backend()

        # Clean paths for Next.js trailing slash / html files
        clean_path = self.path.split("?")[0].rstrip("/")
        if clean_path:
            candidate_file = FRONTEND_OUT / clean_path.lstrip("/")
            candidate_html = FRONTEND_OUT / f"{clean_path.lstrip('/')}.html"
            candidate_index = FRONTEND_OUT / clean_path.lstrip("/") / "index.html"
            if candidate_file.is_file():
                pass
            elif candidate_html.is_file():
                self.path = f"{clean_path}.html"
            elif candidate_index.is_file():
                self.path = f"{clean_path}/index.html"
            elif (FRONTEND_OUT / "404.html").is_file():
                self.path = "/404.html"
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self._proxy_to_backend()
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        if self.path.startswith("/api/"):
            return self._proxy_to_backend()
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            return self._proxy_to_backend()
        self.send_error(405, "Method Not Allowed")

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            return self._proxy_to_backend()
        self.send_response(200)
        self.send_header("Allow", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()


def is_port_in_use(port: int, host: str = "localhost") -> bool:
    for h in [host, "127.0.0.1", "::1"]:
        try:
            family = socket.AF_INET6 if ":" in h else socket.AF_INET
            with socket.socket(family, socket.SOCK_STREAM) as s:
                s.settimeout(0.3)
                if s.connect_ex((h, port)) == 0:
                    return True
        except Exception:
            pass
    return False


def wait_for_url(url: str, timeout: float = 15.0) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "OlympusDesktop/1.0"})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.3)
    return False


def find_edge_binary() -> str:
    candidates = [
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
    ]
    for c in candidates:
        if c.is_file():
            return str(c)
    return ""


def start_backend(python_exe: str) -> subprocess.Popen:
    print("[Olympus] Starting FastAPI Backend on http://localhost:8000...")
    cmd = [
        python_exe,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
    ]
    creationflags = 0
    if sys.platform == "win32":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP

    proc = subprocess.Popen(cmd, cwd=str(ROOT_DIR), creationflags=creationflags)
    return proc


def serve_static_frontend(port: int = 8080) -> ThreadingHTTPServer:
    try:
        server = DualStackServer(("::", port), StandaloneStaticHandler)
    except Exception:
        server = ThreadingHTTPServer(("0.0.0.0", port), StandaloneStaticHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


def terminate_process(proc: subprocess.Popen):
    if not proc or proc.poll() is not None:
        return
    try:
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True)
        else:
            proc.terminate()
            proc.wait(timeout=3)
    except Exception as e:
        print(f"[Olympus] Error terminating process {proc.pid}: {e}")


def clear_stale_ports(ports=(3000, 8000)) -> None:
    if sys.platform == "win32":
        for port in ports:
            try:
                out = subprocess.check_output(
                    f'cmd /c "netstat -ano | findstr :{port}"',
                    shell=True,
                    text=True,
                    stderr=subprocess.DEVNULL,
                )
                for line in out.strip().split("\n"):
                    parts = line.strip().split()
                    if len(parts) >= 5 and "LISTENING" in parts:
                        pid = parts[-1]
                        if pid.isdigit() and int(pid) != os.getpid():
                            subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, capture_output=True)
            except Exception:
                pass


def main():
    parser = argparse.ArgumentParser(description="Olympus LMS Native Desktop Launcher")
    parser.add_argument("--test-headless", action="store_true", help="Run self-test without opening window")
    parser.add_argument("--dev", action="store_true", help="Connect to Next.js dev server on port 3000")
    args = parser.parse_args()

    python_exe = sys.executable
    print("==================================================")
    print("      OLYMPUS LMS - DESKTOP NATIVE RUNNER         ")
    print(f" Python Interpreter: {python_exe}")
    print("==================================================")

    backend_proc = None
    frontend_server = None

    try:
        # Check and cleanup unresponsive zombie processes
        if is_port_in_use(8000) and not wait_for_url("http://localhost:8000/api/v1/health", timeout=1.0):
            print("[Olympus] Cleaning up stale process on port 8000...")
            clear_stale_ports([8000])

        if is_port_in_use(3000) and not wait_for_url("http://localhost:3000/", timeout=1.0):
            print("[Olympus] Cleaning up stale process on port 3000...")
            clear_stale_ports([3000])

        # 1. Start backend if not already running on port 8000
        if not is_port_in_use(8000):
            backend_proc = start_backend(python_exe)
        else:
            print("[Olympus] FastAPI Backend is already running on port 8000.")

        # 2. Wait for backend health check
        print("[Olympus] Waiting for backend to become ready...")
        if not wait_for_url("http://localhost:8000/api/v1/health", timeout=12.0):
            print("[Olympus] Warning: Backend health check timed out. Attempting to proceed anyway.")
        else:
            print("[Olympus] Backend is ready and responding at http://localhost:8000")

        # 3. Determine frontend URL
        target_port = 3000
        target_url = f"http://localhost:{target_port}"
        if args.dev or not FRONTEND_OUT.is_dir():
            print("[Olympus] Mode: Development / Port 3000")
        else:
            if not is_port_in_use(target_port):
                print(f"[Olympus] Serving static export from {FRONTEND_OUT} on port {target_port}...")
                frontend_server = serve_static_frontend(target_port)

        print(f"[Olympus] Frontend Target URL: {target_url}")

        # Wait for frontend readiness before launching browser
        print("[Olympus] Waiting for frontend to become ready...")
        if not wait_for_url(f"{target_url}/", timeout=12.0):
            print("[Olympus] Warning: Frontend readiness check timed out. Proceeding anyway.")
        else:
            print(f"[Olympus] Frontend is verified and responding at {target_url}")

        # 4. Handle headless test mode
        if args.test_headless:
            print("[Olympus] Running headless health tests...")
            with urllib.request.urlopen("http://localhost:8000/api/v1/health") as resp:
                health_data = json.loads(resp.read().decode())
                assert health_data.get("status") == "healthy", "Health check failed"
                print(f"[Olympus] Backend Health: {health_data}")

            with urllib.request.urlopen("http://localhost:8000/api/v1/curriculum") as resp:
                curr_data = json.loads(resp.read().decode())
                modules = curr_data if isinstance(curr_data, list) else curr_data.get("modules", [])
                assert len(modules) >= 10, f"Curriculum incomplete, expected >= 10 modules, got {len(modules)}"
                print(f"[Olympus] Curriculum Verified: {len(modules)} modules loaded.")

            with urllib.request.urlopen(f"http://localhost:{target_port}/") as resp:
                assert resp.status == 200, "Frontend serving check failed"
                print(f"[Olympus] Frontend Verified: http://localhost:{target_port} responding 200 OK.")

            print("[Olympus] Self-test completed successfully!")
            return 0

        # 5. Open native desktop window via Edge App Mode or default browser
        edge_bin = find_edge_binary()
        launched = False
        if edge_bin:
            try:
                print(f"[Olympus] Launching native window via Microsoft Edge App Mode: {edge_bin}")
                edge_cmd = [
                    edge_bin,
                    f"--app={target_url}",
                    "--window-size=1366,850",
                    "--no-first-run",
                    "--no-default-browser-check",
                ]
                subprocess.Popen(edge_cmd)
                launched = True
            except Exception as e:
                print(f"[Olympus] Edge App Mode launch exception ({e}), falling back to default browser.")

        if not launched:
            print("[Olympus] Opening in default web browser...")
            import webbrowser
            webbrowser.open(target_url)

        print("\n" + "=" * 65)
        print(" [OK] OLYMPUS LMS IS OPERATIONAL AND READY!")
        print(f"      - Web Interface : {target_url}")
        print("      - Backend API   : http://localhost:8000/docs")
        print("      Biarkan jendela terminal ini tetap terbuka selama aplikasi digunakan.")
        print("      Tekan Ctrl+C untuk mematikan server dengan aman.")
        print("=" * 65 + "\n")

        # Keep servers alive
        while True:
            time.sleep(1)
            if backend_proc and backend_proc.poll() is not None:
                print(f"[Olympus] Backend terhenti (kode: {backend_proc.returncode}). Memulai ulang backend...")
                backend_proc = start_backend(python_exe)

    except KeyboardInterrupt:
        print("\n[Olympus] Shutting down on user request (Ctrl+C)...")
    finally:
        if frontend_server:
            print("[Olympus] Stopping static frontend server...")
            try:
                frontend_server.shutdown()
            except Exception:
                pass
        if backend_proc:
            print("[Olympus] Stopping FastAPI backend process...")
            terminate_process(backend_proc)
        print("[Olympus] Clean shutdown complete.")

    return 0

if __name__ == "__main__":
    sys.exit(main())
