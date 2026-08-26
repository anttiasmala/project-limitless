// components/shared/ThemeToggleCorner.tsx

'use client';

import { ToggleSwitchDarkLightTheme } from '@/components/shared/ToggleSwitch';
import { useDarkTheme } from '@/hooks/useDarkTheme';
import { twMerge } from 'tailwind-merge';

/**
 * The corner Dark/Light switch as its own client component, so pages that are
 * server components (and therefore able to export `metadata`) can still offer
 * the toggle without becoming client components themselves.
 */
export default function ThemeToggleCorner({
  className,
}: {
  className?: string;
}) {
  const [isDarkTheme, setIsDarkTheme, mounted] = useDarkTheme();

  return (
    <div className={twMerge('absolute top-1 right-1 z-20', className)}>
      <ToggleSwitchDarkLightTheme
        className="cursor-pointer"
        preHydration={!mounted}
        checked={isDarkTheme}
        onChange={(e) => setIsDarkTheme(e.currentTarget.checked)}
      />
    </div>
  );
}
