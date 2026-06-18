import { useCallback, useEffect, useRef, useState } from 'react';

// Tick fast enough that the progress bar moves smoothly, but not every frame.
const TICK_MS = 200;

export function useTimer(
  enabled: boolean,
  duration: number,
  onExpire: () => void,
) {
  // timeLeft is a fractional number of seconds so the bar can move continuously
  // instead of jumping a full second at a time (which made it lag ~1s behind).
  const [timeLeft, setTimeLeft] = useState(duration);
  const onExpireRef = useRef(onExpire);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const reset = useCallback(() => {
    setTimeLeft(duration);
    setRestartKey((key) => key + 1);
  }, [duration]);

  useEffect(() => {
    if (!enabled) return;

    const endTime = Date.now() + duration * 1000;
    let expired = false;

    function tick() {
      const remaining = (endTime - Date.now()) / 1000;
      if (remaining <= 0) {
        setTimeLeft(0);
        if (!expired) {
          expired = true;
          onExpireRef.current();
        }
        return;
      }
      setTimeLeft(remaining);
    }

    // Run once immediately so the bar starts moving right away, with no
    // dead first second before the first tick.
    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [enabled, duration, restartKey]);

  return { timeLeft, reset };
}
