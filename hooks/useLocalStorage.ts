'use client';
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore errors
    }
    setMounted(true);
  }, [key]);

  function set(next: T) {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Ignore errors
    }
  }

  return [value, set, mounted] as const;
}
