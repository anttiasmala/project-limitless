// components/settings/PlayersPanel.tsx

import { useState } from 'react';
import { GameMode } from '@/utils/types';
import { IconPickerModal } from './IconPickerModal';
import Button from '../utils/Button';

type PlayersPanelProps = {
  playerOne: { icon: string; name: string };
  setPlayerOne: (value: { icon: string; name: string }) => void;
  playerTwo: { icon: string; name: string };
  setPlayerTwo: (value: { icon: string; name: string }) => void;
  mode?: GameMode;
  setIsAnyModalOpen: (value: boolean) => void;
};

export function PlayersPanel({
  playerOne,
  setPlayerOne,
  playerTwo,
  setPlayerTwo,
  mode,
  setIsAnyModalOpen,
}: PlayersPanelProps) {
  const [showIconModalPlayerOne, setShowIconModalPlayerOne] = useState(false);
  const [showIconModalPlayerTwo, setShowIconModalPlayerTwo] = useState(false);

  return (
    <>
      <div className="w-72 max-w-[90vw] overflow-hidden rounded-lg border-2 border-slate-300 bg-white dark:border-red-700 dark:bg-red-900">
        <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-red-700 dark:bg-red-800">
          <h3 className="text-center font-bold tracking-wide text-slate-700 dark:text-yellow-300">
            ⚓ Your Crew ☠️
          </h3>
        </div>
        <div className="flex gap-3 p-3">
          {/* Player 1 Card */}
          <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-red-600 dark:bg-red-800/60">
            <div className="flex items-center">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-yellow-400">
                {mode === 'pvc' ? 'You' : 'Player 1'}
              </p>
              <span className="group relative ml-1">
                <Button
                  variant="unstyled"
                  onClick={() =>
                    setPlayerOne({
                      name: 'Davy Jones',
                      icon: '☠️',
                    })
                  }
                  className="hover:bg-slate-300 hover:dark:bg-red-500"
                >
                  🔄
                </Button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                  Reset to default
                </span>
              </span>
            </div>
            <Button
              variant="unstyled"
              onClick={() => {
                setShowIconModalPlayerOne(true);
                setIsAnyModalOpen(true);
              }}
              title="Click to change icon"
              className="h-16 w-16 rounded-full border-4 border-slate-300 bg-white text-4xl shadow-md hover:scale-110 hover:border-amber-500 dark:border-red-600 dark:bg-red-950 dark:hover:border-yellow-400"
            >
              {playerOne.icon}
            </Button>
            <p className="text-xs text-slate-400 select-none dark:text-red-300/70">
              tap to change
            </p>
            <input
              value={playerOne.name}
              onChange={(e) =>
                setPlayerOne({
                  ...playerOne,
                  name: e.currentTarget.value,
                })
              }
              maxLength={16}
              className="w-full rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 transition-all duration-200 focus:border-amber-500 focus:outline-none dark:border-red-700 dark:bg-red-950 dark:text-yellow-300 dark:focus:border-yellow-400"
            />
          </div>

          {/* Player 2 Card */}
          <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-red-600 dark:bg-red-800/60">
            <div className="flex items-center">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-yellow-400">
                {mode === 'pvc' ? 'AI / Kraken' : 'Player 2'}
              </p>
              <span className="group relative ml-1">
                <Button
                  variant="unstyled"
                  onClick={() =>
                    setPlayerTwo({
                      name: 'Capt. Hook',
                      icon: '⚓',
                    })
                  }
                  className="hover:bg-slate-300 hover:dark:bg-red-500"
                >
                  🔄
                </Button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                  Reset to default
                </span>
              </span>
            </div>
            <Button
              variant="unstyled"
              onClick={() => {
                setShowIconModalPlayerTwo(true);
                setIsAnyModalOpen(true);
              }}
              title="Click to change icon"
              className="h-16 w-16 rounded-full border-4 border-slate-300 bg-white text-4xl shadow-md hover:scale-110 hover:border-amber-500 dark:border-red-600 dark:bg-red-950 dark:hover:border-yellow-400"
            >
              {playerTwo.icon}
            </Button>
            <p className="text-xs text-slate-400 select-none dark:text-red-300/70">
              tap to change
            </p>
            <input
              value={playerTwo.name}
              onChange={(e) =>
                setPlayerTwo({
                  ...playerTwo,
                  name: e.currentTarget.value,
                })
              }
              maxLength={16}
              className="w-full rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 transition-all duration-200 focus:border-amber-500 focus:outline-none dark:border-red-700 dark:bg-red-950 dark:text-yellow-300 dark:focus:border-yellow-400"
            />
          </div>
        </div>
      </div>

      <IconPickerModal
        showModal={showIconModalPlayerOne}
        setPlayer={setPlayerOne}
        player={playerOne}
        otherPlayer={playerTwo}
        onClose={() => {
          setShowIconModalPlayerOne(false);
          setIsAnyModalOpen(false);
        }}
      />
      <IconPickerModal
        showModal={showIconModalPlayerTwo}
        setPlayer={setPlayerTwo}
        player={playerTwo}
        otherPlayer={playerOne}
        onClose={() => {
          setShowIconModalPlayerTwo(false);
          setIsAnyModalOpen(false);
        }}
      />
    </>
  );
}
