import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(key);
    if (stored === null) return;
    try {
      setValue(JSON.parse(stored) as T);
    } catch {
      return;
    }
  }, [key]);

  function set(next: T) {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  return [value, set, mounted] as const;
}
