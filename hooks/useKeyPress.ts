import { useEffect, useEffectEvent } from 'react';
import { KeyboardEventKeys } from '@/utils/types';

export function useKeyPress(
  key: KeyboardEventKeys,
  onKeyPress: (event: KeyboardEvent) => void,
  active: boolean = true,
) {
  // Always calls the newest onKeyPress, so the listener does not need to be
  // removed and added again when the parent passes a new function.
  const handleKeyPress = useEffectEvent(onKeyPress);

  useEffect(() => {
    if (!active) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === key) handleKeyPress(e);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, active]);
}
