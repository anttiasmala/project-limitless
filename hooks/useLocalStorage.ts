// hooks/useLocalStorage.ts
import { useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  });

  function set(next: T) {
    setValue(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(next));
    }
  }

  return [value, set] as const;
}
