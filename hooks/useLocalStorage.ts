'use client';
import { useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    // Lazy initializer runs once on mount, safe from SSR issues in client components
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  function set(next: T) {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  // mounted is always true after hydration since this is a 'use client' component
  return [value, set, true] as const;
}
