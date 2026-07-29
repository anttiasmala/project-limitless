// hooks/useDarkTheme.ts

'use client';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// The `dark` class on <html> is what Tailwind's dark: variant uses
// (darkMode: 'class'). app/layout.tsx sets it before paint to avoid a flash, but
// only once — this hook keeps it in sync whenever the stored value changes.
// Use it instead of useLocalStorage('isDarkTheme', ...) anywhere the theme can
// be toggled, otherwise the colors won't update until a reload.
export function useDarkTheme() {
  const [isDarkTheme, setIsDarkTheme, mounted] = useLocalStorage(
    'isDarkTheme',
    true,
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  return [isDarkTheme, setIsDarkTheme, mounted] as const;
}
