import { RefObject, useCallback, useEffect, useRef } from 'react';

type DragOptions = {
  // Blocks a drag before it starts — a maximized window cannot be moved.
  disabled?: boolean;
  // Fired on mouse-up with the position the window came to rest at.
  onMoveEnd: (top: number, left: number) => void;
};

// Drag a window by its title bar. Attach the returned handler to whatever
// element should act as the grab area; it moves the element `windowRef` points
// at, which must be absolutely positioned.
//
// The position is written straight to the DOM node while the mouse moves —
// routing every frame through React state would re-render the window's whole
// contents — and is only committed via `onMoveEnd` on release.
export function useWindowDrag(
  windowRef: RefObject<HTMLElement | null>,
  { disabled, onMoveEnd }: DragOptions,
) {
  // Keep the latest options without re-creating the handler on every render.
  const optionsRef = useRef({ disabled, onMoveEnd });
  useEffect(() => {
    optionsRef.current = { disabled, onMoveEnd };
  });

  return useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left button only
      if (optionsRef.current.disabled) return;
      const div = windowRef.current;
      if (!div) return;
      e.preventDefault(); // avoid selecting the title text while dragging

      const startX = e.clientX;
      const startY = e.clientY;
      const startTop = div.offsetTop;
      const startLeft = div.offsetLeft;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const maxLeft = document.documentElement.clientWidth - div.offsetWidth;
        const maxTop = document.documentElement.clientHeight - div.offsetHeight;

        const nextLeft = startLeft + (moveEvent.clientX - startX);
        const nextTop = startTop + (moveEvent.clientY - startY);

        div.style.left = `${Math.max(0, Math.min(nextLeft, maxLeft))}px`;
        div.style.top = `${Math.max(0, Math.min(nextTop, maxTop - 35))}px`;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        optionsRef.current.onMoveEnd(div.offsetTop, div.offsetLeft);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [windowRef],
  );
}
