// components/multiplayer/SettingsModal.tsx

import { useKeyPress } from '@/hooks/useKeyPress';
import { useCallback } from 'react';
import { createPortal } from 'react-dom';

export function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  isAudioMuted,
  setIsAudioMuted,
  volume,
  setVolume,
  AudioArray,
  isDarkTheme,
  setIsDarkTheme,
  isArrowKeysEnabled,
  setIsArrowKeysEnabled,
}: {
  showSettingsModal: boolean;
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
  AudioArray: React.RefObject<HTMLAudioElement | null>[];
  isAudioMuted: boolean;
  setIsAudioMuted: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
  isArrowKeysEnabled: boolean;
  setIsArrowKeysEnabled: (value: boolean) => void;
}) {
  const handleClose = useCallback(
    () => setShowSettingsModal(false),
    [setShowSettingsModal],
  );

  useKeyPress('Escape', handleClose, showSettingsModal);

  if (!showSettingsModal) return null;

  return createPortal(
    <div className={`${isDarkTheme ? 'dark' : ''}`}>
      <div
        className="fixed top-0 left-0 z-98 h-full w-full bg-black opacity-80"
        onClick={() => setShowSettingsModal(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game settings"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2"
      >
        <button
          className="py-2 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-slate-100 hover:border-amber-500 dark:hover:bg-red-800 dark:hover:border-yellow-500 cursor-pointer transition-all duration-200 tracking-wide w-full mb-2"
          onClick={() => setShowSettingsModal(false)}
        >
          ⚓ Close Window ☠️
        </button>
        <div className="w-48 max-w-[90vw] h-auto min-h-48 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-red-800 dark:hover:border-yellow-500">
          <div className="mt-3 ml-3 flex flex-col">
            <div className="flex">
              <label className="cursor-pointer select-none">
                Mute sounds
                <input
                  type="checkbox"
                  className="ml-2 w-5 h-5 cursor-pointer align-middle"
                  checked={isAudioMuted}
                  onChange={(e) => {
                    const muted = e.target.checked;
                    setIsAudioMuted(muted);
                    if (!muted && volume === 0) {
                      setVolume(0.5);
                      AudioArray.forEach((ref) => {
                        if (ref.current) ref.current.volume = 0.5;
                      });
                    }
                    AudioArray.forEach((ref) => {
                      if (ref.current) ref.current.muted = muted;
                    });
                  }}
                />
              </label>
            </div>

            {/* Dark theme logic */}

            <div className="mt-3 flex">
              <label className="cursor-pointer select-none">
                Dark Theme
                <input
                  type="checkbox"
                  className="ml-2 w-5 h-5 cursor-pointer align-middle"
                  checked={isDarkTheme}
                  onChange={(e) => setIsDarkTheme(e.target.checked)}
                />
              </label>
            </div>

            {/* Arrowkeys Enabling logic */}

            <div className="mt-3 flex">
              <label className="cursor-pointer select-none">
                Arrow keys
                <input
                  type="checkbox"
                  className="ml-2 w-5 h-5 cursor-pointer align-middle"
                  checked={isArrowKeysEnabled}
                  onChange={(e) => setIsArrowKeysEnabled(e.target.checked)}
                />
              </label>
            </div>

            {/* Volume slider logic */}

            <div className="mt-3 flex">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                className="cursor-pointer w-max accent-yellow-400"
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  const muted = vol === 0;
                  setIsAudioMuted(muted);
                  AudioArray.forEach((ref) => {
                    if (ref.current) {
                      ref.current.volume = vol;
                      ref.current.muted = muted;
                    }
                  });
                }}
              />
              <p className="ml-3">{Math.floor(volume * 100)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
