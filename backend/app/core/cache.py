from datetime import datetime, timezone
import threading
from typing import Any, Dict, Optional, Tuple


class SimpleMemoryCache:
    """Thread-safe, lightweight in-memory cache with TTL support."""

    def __init__(self) -> None:
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        now = datetime.now(timezone.utc).timestamp()
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            val, expires_at = entry
            if now > expires_at:
                del self._cache[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: float = 300.0, ttl: Optional[float] = None) -> None:
        effective_ttl = ttl if ttl is not None else ttl_seconds
        expires_at = datetime.now(timezone.utc).timestamp() + effective_ttl
        with self._lock:
            self._cache[key] = (value, expires_at)

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> None:
        with self._lock:
            keys_to_del = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_del:
                del self._cache[k]

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


# Global memory cache instance for Olympus LMS backend
memory_cache = SimpleMemoryCache()
