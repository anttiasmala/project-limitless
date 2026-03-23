import { useEffect, useRef } from 'react';

type Props = {
  count: number;
  max?: number;
};

export default function TreasureChests({ count, max = 5 }: Props) {
  const prevCount = useRef(count);
  const justFilledIndex = count > prevCount.current ? count - 1 : null;

  useEffect(() => {
    prevCount.current = count;
  }, [count]);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-xl transition-all duration-300 ${
            i < count
              ? 'opacity-100 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]'
              : 'opacity-20 grayscale'
          } ${i === justFilledIndex ? 'animate-pop' : ''}`}
        >
          {i < count ? '💰' : '🪙'}
        </span>
      ))}
    </div>
  );
}
