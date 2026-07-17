import { RefObject, useCallback, useEffect, useRef } from 'react';

// The edges being dragged. Compound directions are corners, so 'nw' moves the
// north and west edges at once.
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type ResizeOptions = {
  // Blocks a resize before it starts — a maximized window has fixed edges.
  disabled?: boolean;
  // Smallest the window may be dragged down to.
  minWidth: number;
  minHeight: number;
  // Fired on mouse-up. The origin is reported too because dragging the west or
  // north edge moves it.
  onResizeEnd: (
    width: number,
    height: number,
    top: number,
    left: number,
  ) => void;
};

// Resize a window from any edge or corner. Call the returned function with a
// direction to get the mouse-down handler for that edge's grab strip.
//
// As with dragging, the size is written straight to the DOM while the mouse
// moves and only committed via `onResizeEnd` on release.
export function useWindowResize(
  windowRef: RefObject<HTMLElement | null>,
  { disabled, minWidth, minHeight, onResizeEnd }: ResizeOptions,
) {
  // Keep the latest options without re-creating the handler on every render.
  const optionsRef = useRef({ disabled, minWidth, minHeight, onResizeEnd });
  useEffect(() => {
    optionsRef.current = { disabled, minWidth, minHeight, onResizeEnd };
  });

  return useCallback(
    (dir: ResizeDirection) => (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left button only
      if (optionsRef.current.disabled) return;
      const div = windowRef.current;
      if (!div) return;
      e.preventDefault(); // avoid text selection while dragging

      const north = dir.includes('n');
      const south = dir.includes('s');
      const east = dir.includes('e');
      const west = dir.includes('w');

      const startX = e.clientX;
      const startY = e.clientY;
      const startTop = div.offsetTop;
      const startLeft = div.offsetLeft;
      const startWidth = div.offsetWidth;
      const startHeight = div.offsetHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const { minWidth, minHeight } = optionsRef.current;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        // East/south edges grow with the cursor; west/north edges grow against
        // it (dragging left/up makes the window bigger).
        let nextWidth = startWidth;
        let nextHeight = startHeight;
        if (east) nextWidth = Math.max(minWidth, startWidth + dx);
        if (west) nextWidth = Math.max(minWidth, startWidth - dx);
        if (south) nextHeight = Math.max(minHeight, startHeight + dy);
        if (north) nextHeight = Math.max(minHeight, startHeight - dy);

        div.style.width = `${nextWidth}px`;
        div.style.height = `${nextHeight}px`;
        // Only the west/north edges move the origin. Shifting by the size delta
        // (not the raw cursor delta) keeps the opposite edge pinned even after
        // the window hits its minimum size.
        if (west) div.style.left = `${startLeft + (startWidth - nextWidth)}px`;
        if (north) div.style.top = `${startTop + (startHeight - nextHeight)}px`;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        optionsRef.current.onResizeEnd(
          div.offsetWidth,
          div.offsetHeight,
          div.offsetTop,
          div.offsetLeft,
        );
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [windowRef],
  );
}
