import React from 'react';

type WinningLineProps = {
  winLine: number[];
  cellSize?: number;
  gap?: number;
  cols?: number;
};

function getCellCenter(
  index: number,
  cellSize: number,
  gap: number,
  cols: number,
): { x: number; y: number } {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const step = cellSize + gap;
  return {
    x: col * step + cellSize / 2,
    y: row * step + cellSize / 2,
  };
}

export default function WinningLine({
  winLine,
  cellSize = 96,
  gap = 12,
  cols = 3,
}: WinningLineProps) {
  if (winLine.length < 2) return null;

  const gridSize = cellSize * cols + gap * (cols - 1);

  const start = getCellCenter(winLine[0], cellSize, gap, cols);
  const end = getCellCenter(winLine[winLine.length - 1], cellSize, gap, cols);

  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={gridSize}
      height={gridSize}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
    >
      {/* Rope shadow for depth */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#92400e"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${length} ${length}`}
        strokeDashoffset={length}
        style={{ animation: 'drawLine 0.5s ease-out 0.1s forwards' }}
      />
      {/* Dashed rope texture */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#facc15"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="4 6"
        style={{ opacity: 0, animation: 'fadeIn 0.1s ease-out 0.55s forwards' }}
      />
      {/* Animated drawing line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#facc15"
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={`${length} ${length}`}
        strokeDashoffset={length}
        style={{ animation: 'drawLine 0.5s ease-out 0.1s forwards' }}
      />
    </svg>
  );
}
