import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(
  enabled: boolean,
  duration: number,
  onExpire: () => void,
) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const reset = useCallback(() => setTimeLeft(duration), [duration]);

  useEffect(() => {
    if (!enabled) return;
    if (timeLeft <= 0) {
      onExpireRef.current();
      return;
    }
    const tick = setTimeout(() => setTimeLeft((time) => time - 1), 1000);
    return () => clearTimeout(tick);
  }, [enabled, timeLeft]);

  return { timeLeft, reset };
}
