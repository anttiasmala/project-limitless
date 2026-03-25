import { useCallback, useEffect, useRef } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export function useSwipeNavigation(
  containerRef: React.RefObject<HTMLElement | null>,
  onSwipe: (direction: SwipeDirection) => void,
  threshold = 30,
) {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (startPos.current) e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]); // re-run when the DOM node is available

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    startPos.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startPos.current.x;
      const dy = t.clientY - startPos.current.y;
      startPos.current = null;

      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return; // tap, not swipe

      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
    },
    [onSwipe, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
