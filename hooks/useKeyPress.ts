import { useEffect } from 'react';
import { KeyboardEventKeys } from '@/utils/types';

export function useKeyPress(
  key: KeyboardEventKeys,
  onKeyPress: (event: KeyboardEvent) => void,
  active: boolean = true,
) {
  useEffect(() => {
    if (!active) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === key) onKeyPress(e);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, onKeyPress, active]);
}
