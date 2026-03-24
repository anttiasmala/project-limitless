import { useCallback, useRef } from 'react';

export function useGridNavigation(cols: number = 3) {
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = useRef<number>(0);

  const setRef = useCallback(
    (element: HTMLButtonElement | null, index: number) => {
      cellRefs.current[index] = element;
    },
    [],
  );

  const focusCell = useCallback(
    (index: number) => {
      const total = cols * cols;
      if (index < 0 || index >= total) return;
      activeIndex.current = index;
      cellRefs.current[index]?.focus();
    },
    [cols],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (col < cols - 1) focusCell(index + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) focusCell(index - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (row < cols - 1) focusCell(index + cols);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) focusCell(index - cols);
          break;
        case 'Home':
          e.preventDefault();
          focusCell(row * cols); // first cell in row
          break;
        case 'End':
          e.preventDefault();
          focusCell(row * cols + cols - 1); // last cell in row
          break;
      }
    },
    [cols, focusCell],
  );

  const resetFocus = useCallback((index: number = 0) => {
    activeIndex.current = index;
  }, []);

  return { setRef, handleKeyDown, focusCell, activeIndex, resetFocus };
}
