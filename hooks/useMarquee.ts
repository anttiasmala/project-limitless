import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

// A rectangle expressed in the coordinate space of the marquee container
// (i.e. relative to the container's top-left corner, not the viewport).
export type MarqueeRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type MarqueeHandlers = {
  // Fired on mouse-down that begins a marquee (a left-click on empty container).
  onStart?: () => void;
  // Fired on every mouse-move while dragging, with the current rectangle.
  onChange?: (rect: MarqueeRect) => void;
};

// Windows-XP style rubber-band selection. Attach the returned `onMouseDown` to
// a container and render `rect` (when non-null) as an absolutely positioned
// box inside that same container.
//
// A drag only starts when the press lands on the container element itself, so
// clicking a child (folder, window, taskbar…) never begins a selection.
export function useMarquee(
  containerRef: RefObject<HTMLElement | null>,
  handlers?: MarqueeHandlers,
) {
  const [rect, setRect] = useState<MarqueeRect | null>(null);
  // Keep the latest handlers without re-creating onMouseDown on every render.
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Left button only, and only when the empty container is pressed.
      if (e.button !== 0 || e.target !== e.currentTarget) return;
      const container = containerRef.current;
      if (!container) return;

      // Avoid the browser starting a text selection during the drag.
      e.preventDefault();

      const bounds = container.getBoundingClientRect();
      const startX = e.clientX - bounds.left;
      const startY = e.clientY - bounds.top;

      handlersRef.current?.onStart?.();

      const handleMove = (event: MouseEvent) => {
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const next: MarqueeRect = {
          left: Math.min(startX, x),
          top: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY),
        };
        setRect(next);
        handlersRef.current?.onChange?.(next);
      };

      const handleUp = () => {
        setRect(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [containerRef],
  );

  return { rect, onMouseDown };
}
