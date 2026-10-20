/**
 * High-performance client-side cache utility.
 * Combines in-memory Map, sessionStorage, and Stale-While-Revalidate (SWR)
 * to provide 0ms instant loading across views and navigation.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  ttlMs: number = 60_000
): Promise<T> {
  const method = options?.method || "GET";
  const cacheKey = `${method}:${url}`;
  const now = Date.now();

  // 1. In-memory check (fastest: 0ms)
  const memCached = memoryCache.get(cacheKey);
  if (memCached) {
    if (now - memCached.timestamp < ttlMs) {
      return memCached.data as T;
    }
    // Stale: trigger background refresh but return cached data immediately
    backgroundRefresh(url, options, cacheKey);
    return memCached.data as T;
  }

  // 2. SessionStorage check (persists across page navigations in current tab: 0ms)
  if (typeof window !== "undefined" && method === "GET") {
    try {
      const stored = sessionStorage.getItem(`olympus_cache:${cacheKey}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (now - parsed.timestamp < ttlMs) {
          memoryCache.set(cacheKey, parsed);
          return parsed.data;
        }
        // Stale: trigger background refresh but return cached data immediately
        backgroundRefresh(url, options, cacheKey);
        memoryCache.set(cacheKey, parsed);
        return parsed.data;
      }
    } catch {
      // sessionStorage unavailable or parse error, fallback to network
    }
  }

  // 3. Network fetch if no cache found
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${res.statusText}`);
  }
  const data = await res.json();
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };

  memoryCache.set(cacheKey, entry);
  if (typeof window !== "undefined" && method === "GET") {
    try {
      sessionStorage.setItem(`olympus_cache:${cacheKey}`, JSON.stringify(entry));
    } catch {
      // Storage quota or disabled, memory cache handles it
    }
  }

  return data;
}

function backgroundRefresh(url: string, options: RequestInit | undefined, cacheKey: string) {
  fetch(url, options)
    .then((res) => (res.ok ? res.json() : null))
    .then((freshData) => {
      if (freshData !== null) {
        const entry = { data: freshData, timestamp: Date.now() };
        memoryCache.set(cacheKey, entry);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(`olympus_cache:${cacheKey}`, JSON.stringify(entry));
          } catch {}
        }
      }
    })
    .catch(() => {});
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      try {
        const keys = Object.keys(sessionStorage).filter((k) =>
          k.startsWith("olympus_cache:")
        );
        keys.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
    return;
  }

  memoryCache.forEach((_, key) => {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  });

  if (typeof window !== "undefined") {
    try {
      const keys = Object.keys(sessionStorage).filter(
        (k) => k.startsWith("olympus_cache:") && k.includes(pattern)
      );
      keys.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}
