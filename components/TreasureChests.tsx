import { useEffect, useRef, useState } from 'react';

type Props = {
  count: number;
  max?: number;
};

export default function TreasureChests({ count, max = 5 }: Props) {
  const [justFilledIndex, setJustFilledIndex] = useState<number | null>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    let clearTimer: number | undefined;
    let setIndexTimer: number | undefined;

    if (count > prevCount.current) {
      setIndexTimer = window.setTimeout(() => {
        setJustFilledIndex(count - 1);
        clearTimer = window.setTimeout(() => setJustFilledIndex(null), 300);
      }, 0);
    } else if (count !== prevCount.current) {
      setIndexTimer = window.setTimeout(() => setJustFilledIndex(null), 0);
    }

    prevCount.current = count;

    return () => {
      if (setIndexTimer !== undefined) {
        window.clearTimeout(setIndexTimer);
      }
      if (clearTimer !== undefined) {
        window.clearTimeout(clearTimer);
      }
    };
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
