import { useEffect, useRef, useState } from 'react';

type GridMeasurement = {
  cellSize: number;
  gap: number;
};

export function useGridMeasure(cols: number = 3): {
  gridRef: React.RefObject<HTMLDivElement | null>;
  measurement: GridMeasurement;
} {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [measurement, setMeasurement] = useState<GridMeasurement>({
    cellSize: 96,
    gap: 12,
  });

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    function measure() {
      if (!element) return;
      const children = Array.from(element.children) as HTMLElement[];
      if (children.length < 2) return;

      const first = children[0].getBoundingClientRect();
      const second = children[1].getBoundingClientRect();

      const cellSize = first.width;
      const gap = second.left - first.right;

      setMeasurement({ cellSize: Math.round(cellSize), gap: Math.round(gap) });
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [cols]);

  return { gridRef, measurement };
}
