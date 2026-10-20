"use client";

import { useEffect } from "react";

function patchFetchForDesktop() {
  if (typeof window === "undefined") return;

  if (!(window as any).__OLYMPUS_FETCH_PATCHED__) {
    (window as any).__OLYMPUS_FETCH_PATCHED__ = true;
    const originalFetch = window.fetch;

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      if (typeof input === "string" && input.startsWith("/api/")) {
        // In Tauri or non-standard protocol, always target backend port 8000 directly
        const isNonHttpOrigin =
          (window as any).__TAURI__ !== undefined ||
          window.location.protocol === "tauri:" ||
          window.location.protocol === "file:" ||
          window.location.hostname === "tauri.localhost";

        if (isNonHttpOrigin) {
          return originalFetch.call(this, `http://localhost:8000${input}`, init);
        }

        // In web / desktop edge mode: try relative /api/ first, fallback directly to port 8000 on network failure
        try {
          const res = await originalFetch.call(this, input, init);
          if (!res.ok && (res.status === 502 || res.status === 504)) {
            return await originalFetch.call(this, `http://localhost:8000${input}`, init);
          }
          return res;
        } catch (err) {
          // Transparently fallback to FastAPI directly on localhost:8000
          return await originalFetch.call(this, `http://localhost:8000${input}`, init);
        }
      }
      return originalFetch.call(this, input, init);
    };
  }
}

// Execute immediately when the module is imported in client context
if (typeof window !== "undefined") {
  patchFetchForDesktop();
}

export function DesktopApiBridge() {
  useEffect(() => {
    patchFetchForDesktop();
  }, []);

  return null;
}
