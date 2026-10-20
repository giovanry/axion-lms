// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, RunEvent, WindowEvent};

struct BackendState {
    child: Arc<Mutex<Option<Child>>>,
}

fn find_project_root() -> PathBuf {
    if let Ok(exe_path) = env::current_exe() {
        let mut curr = exe_path;
        while let Some(parent) = curr.parent() {
            if parent.join("backend").exists() && parent.join("curriculum").exists() {
                return parent.to_path_buf();
            }
            curr = parent.to_path_buf();
        }
    }

    if let Ok(cwd) = env::current_dir() {
        if cwd.join("backend").exists() {
            return cwd;
        }
        if let Some(parent) = cwd.parent() {
            if parent.join("backend").exists() {
                return parent.to_path_buf();
            }
        }
    }

    PathBuf::from(".")
}

fn find_python_executable() -> String {
    // 1. Check if 'python' runs
    if let Ok(output) = Command::new("where").arg("python").output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if let Some(first_line) = stdout.lines().next() {
                let trimmed = first_line.trim();
                if !trimmed.is_empty() && Path::new(trimmed).exists() {
                    return trimmed.to_string();
                }
            }
        }
    }

    // 2. Check standard Windows AppData Python install location
    if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
        let p310 = Path::new(&local_app_data)
            .join("Programs")
            .join("Python")
            .join("Python310")
            .join("python.exe");
        if p310.exists() {
            return p310.to_string_lossy().to_string();
        }

        let p311 = Path::new(&local_app_data)
            .join("Programs")
            .join("Python")
            .join("Python311")
            .join("python.exe");
        if p311.exists() {
            return p311.to_string_lossy().to_string();
        }

        let p312 = Path::new(&local_app_data)
            .join("Programs")
            .join("Python")
            .join("Python312")
            .join("python.exe");
        if p312.exists() {
            return p312.to_string_lossy().to_string();
        }
    }

    // Default fallback
    "python".to_string()
}

fn stop_backend(child_mutex: &Arc<Mutex<Option<Child>>>) {
    if let Ok(mut guard) = child_mutex.lock() {
        if let Some(mut child) = guard.take() {
            let pid = child.id();
            println!("[Tauri] Terminating backend process PID {}", pid);
            let _ = child.kill();

            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill")
                    .args(["/F", "/T", "/PID", &pid.to_string()])
                    .output();
            }
        }
    }
}

fn main() {
    let backend_child = Arc::new(Mutex::new(None));
    let state_child = backend_child.clone();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(BackendState {
            child: state_child,
        })
        .setup(move |app| {
            let root_dir = find_project_root();
            let python_bin = find_python_executable();

            println!("[Tauri] Project Root: {:?}", root_dir);
            println!("[Tauri] Python Binary: {}", python_bin);

            // Spawn FastAPI backend: python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
            let child_res = Command::new(&python_bin)
                .current_dir(&root_dir)
                .args(["-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"])
                .spawn();

            match child_res {
                Ok(child) => {
                    println!("[Tauri] Backend spawned successfully (PID: {})", child.id());
                    let state = app.state::<BackendState>();
                    if let Ok(mut guard) = state.child.lock() {
                        *guard = Some(child);
                    }
                }
                Err(err) => {
                    eprintln!("[Tauri] Failed to spawn FastAPI backend: {}", err);
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    let exit_child = backend_child.clone();
    app.run(move |_app_handle, event| match event {
        RunEvent::WindowEvent {
            event: WindowEvent::CloseRequested { .. },
            ..
        } => {
            println!("[Tauri] Window close requested, shutting down backend...");
            stop_backend(&exit_child);
        }
        RunEvent::Exit => {
            println!("[Tauri] App exit, ensuring backend shutdown...");
            stop_backend(&exit_child);
        }
        _ => {}
    });
}
