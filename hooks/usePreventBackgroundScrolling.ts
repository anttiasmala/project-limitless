// hooks/usePreventBodyScrolling.ts

import { useEffect } from 'react';

/** Prevents background page scrolling. Used in Modals */
export default function usePreventBackgroundScrolling(condition: boolean) {
  useEffect(() => {
    if (!condition) return;
    // prevent background page scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [condition]);
}
