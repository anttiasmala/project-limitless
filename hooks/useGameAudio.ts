import { useEffect, useRef } from 'react';

export function useGameAudio(volume: number, isAudioMuted: boolean) {
  const cannonAudio = useRef<HTMLAudioElement | null>(null);
  const splashAudio = useRef<HTMLAudioElement | null>(null);
  const creakAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    cannonAudio.current ??= new Audio('/sounds/cannon.mp3');
    splashAudio.current ??= new Audio('/sounds/splash.mp3');
    creakAudio.current ??= new Audio('/sounds/creak.mp3');

    [cannonAudio, splashAudio, creakAudio].forEach((ref) => {
      if (ref.current) {
        ref.current.volume = volume;
        ref.current.muted = isAudioMuted;
      }
    });
  }, [volume, isAudioMuted]);

  function playSound(ref: React.RefObject<HTMLAudioElement | null>) {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
    }
  }

  return { cannonAudio, splashAudio, creakAudio, playSound };
}
