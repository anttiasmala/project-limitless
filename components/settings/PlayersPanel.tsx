// components/settings/PlayersPanel.tsx

import { useState } from 'react';
import { IconPickerModal } from './IconPickerModal';
import Button from '../utils/Button';

type PlayersPanelProps = {
  playerOne: { icon: string; name: string };
  setPlayerOne: (value: { icon: string; name: string }) => void;
  playerTwo: { icon: string; name: string };
  setPlayerTwo: (value: { icon: string; name: string }) => void;
  mode?: 'pvp' | 'pvc' | 'watch';
};

export function PlayersPanel({
  playerOne,
  setPlayerOne,
  playerTwo,
  setPlayerTwo,
  mode,
}: PlayersPanelProps) {
  const [showIconModalPlayerOne, setShowIconModalPlayerOne] = useState(false);
  const [showIconModalPlayerTwo, setShowIconModalPlayerTwo] = useState(false);

  return (
    <>
      <div className="w-72 max-w-[90vw] bg-white border-2 border-slate-300 dark:bg-red-900 dark:border-red-700 rounded-lg overflow-hidden">
        <div className="bg-slate-100 dark:bg-red-800 px-4 py-2 border-b border-slate-200 dark:border-red-700">
          <h3 className="text-center font-bold text-slate-700 dark:text-yellow-300 tracking-wide">
            ⚓ Your Crew ☠️
          </h3>
        </div>
        <div className="flex gap-3 p-3">
          {/* Player 1 Card */}
          <div className="flex-1 flex flex-col items-center gap-2 bg-slate-50 dark:bg-red-800/60 rounded-lg p-3 border border-slate-200 dark:border-red-600">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-500 dark:text-yellow-400 uppercase tracking-wider">
                {mode === 'pvc' ? 'You' : 'Player 1'}
              </p>
              <span className="ml-1 relative group">
                <Button
                  variant="unstyled"
                  onClick={() =>
                    setPlayerOne({
                      name: 'Davy Jones',
                      icon: '☠️',
                    })
                  }
                  className="hover:dark:bg-red-500 hover:bg-slate-300"
                >
                  🔄
                </Button>
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                  Reset to default
                </span>
              </span>
            </div>
            <Button
              variant="unstyled"
              onClick={() => setShowIconModalPlayerOne(true)}
              title="Click to change icon"
              className="text-4xl w-16 h-16 rounded-full border-4 border-slate-300 dark:border-red-600 hover:border-amber-500 dark:hover:border-yellow-400 hover:scale-110 bg-white dark:bg-red-950 shadow-md"
            >
              {playerOne.icon}
            </Button>
            <p className="text-xs text-slate-400 dark:text-red-300/70 select-none">
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
              className="w-full text-center bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 text-slate-800 dark:text-yellow-300 font-bold rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-all duration-200"
            />
          </div>

          {/* Player 2 Card */}
          <div className="flex-1 flex flex-col items-center gap-2 bg-slate-50 dark:bg-red-800/60 rounded-lg p-3 border border-slate-200 dark:border-red-600">
            <div className="flex items-center">
              <p className="text-xs font-bold text-slate-500 dark:text-yellow-400 uppercase tracking-wider">
                {mode === 'pvc' ? 'AI / Kraken' : 'Player 2'}
              </p>
              <span className="ml-1 relative group">
                <Button
                  variant="unstyled"
                  onClick={() =>
                    setPlayerTwo({
                      name: 'Capt. Hook',
                      icon: '⚓',
                    })
                  }
                  className="hover:dark:bg-red-500 hover:bg-slate-300"
                >
                  🔄
                </Button>
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                  Reset to default
                </span>
              </span>
            </div>
            <Button
              variant="unstyled"
              onClick={() => setShowIconModalPlayerTwo(true)}
              title="Click to change icon"
              className="text-4xl w-16 h-16 rounded-full border-4 border-slate-300 dark:border-red-600 hover:border-amber-500 dark:hover:border-yellow-400 hover:scale-110 bg-white dark:bg-red-950 shadow-md"
            >
              {playerTwo.icon}
            </Button>
            <p className="text-xs text-slate-400 dark:text-red-300/70 select-none">
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
              className="w-full text-center bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 text-slate-800 dark:text-yellow-300 font-bold rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <IconPickerModal
        showModal={showIconModalPlayerOne}
        setPlayer={setPlayerOne}
        player={playerOne}
        otherPlayer={playerTwo}
        onClose={() => setShowIconModalPlayerOne(false)}
      />
      <IconPickerModal
        showModal={showIconModalPlayerTwo}
        setPlayer={setPlayerTwo}
        player={playerTwo}
        otherPlayer={playerOne}
        onClose={() => setShowIconModalPlayerTwo(false)}
      />
    </>
  );
}
