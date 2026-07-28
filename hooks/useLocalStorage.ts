// hooks/useLocalStorage.ts

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  // The latest value, readable outside of a render
  const valueRef = useRef<T>(fallback);

  // Every path that changes the value goes through here so the ref can't drift
  // away from the state
  const store = useCallback((next: T) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        store(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore errors
    }
    setMounted(true);
  }, [key, store]);

  // Keep this instance in sync with writes from other instances of the same key
  // (in-tab) and with other tabs/windows (via the storage event).
  useEffect(() => {
    const onLocal = (next: unknown) => store(next as T);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        store(JSON.parse(e.newValue) as T);
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
  }, [key, store]);

  function set(next: T | ((prev: T) => T)) {
    const resolved =
      typeof next === 'function'
        ? (next as (prev: T) => T)(valueRef.current)
        : next;
    // Written here rather than inside a `setValue` updater: React skips pending
    // updaters for a component that unmounts first, so a caller that saves and
    // closes its window in the same handler would otherwise lose the write
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch {
      // Ignore errors
    }
    store(resolved);
    // Notify the other in-tab instances so they re-render immediately. The
    // `storage` event only fires in *other* tabs, so it can't cover this
    broadcast(key, resolved);
  }

  return [value, set, mounted] as const;
}
