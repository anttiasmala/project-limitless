// hooks/useLocalStorage.ts

'use client';
import { useState, useEffect } from 'react';

// Per-key subscribers so every useLocalStorage instance sharing a key stays in
// sync within the tab. Without this each call site keeps its own useState and
// only reads localStorage on mount, so a write in one component (e.g. renaming
// a player in settings) wouldn't reach the others until a full refresh.
const listeners = new Map<string, Set<(value: unknown) => void>>();

function subscribe(key: string, fn: (value: unknown) => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) listeners.delete(key);
  };
}

function broadcast(key: string, value: unknown) {
  listeners.get(key)?.forEach((fn) => fn(value));
}

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

  // Keep this instance in sync with writes from other instances of the same key
  // (in-tab) and with other tabs/windows (via the storage event).
  useEffect(() => {
    const onLocal = (next: unknown) => setValue(next as T);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        // Ignore errors
      }
    };
    const unsubscribe = subscribe(key, onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, [key]);

  function set(next: T | ((prev: T) => T)) {
    setValue((prev) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Ignore errors
      }
      // Notify the other in-tab instances so they re-render immediately. The
      // `storage` event only fires in *other* tabs, so it can't cover this.
      // Deferred to a microtask so we don't update other components while this
      // one is still inside its state updater.
      queueMicrotask(() => broadcast(key, resolved));
      return resolved;
    });
  }

  return [value, set, mounted] as const;
}
