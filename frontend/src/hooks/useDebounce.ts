import { useEffect, useState } from "react";

/**
 * Custom hook to debounce value changes, preventing expensive re-renders
 * and high-frequency backend API calls during rapid typing.
 *
 * @param value The raw input value
 * @param delay Debounce delay in milliseconds (default 280ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 280): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
