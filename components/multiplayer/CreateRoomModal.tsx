// components/multiplayer/CreateRoomModal.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useKeyPress } from '@/hooks/useKeyPress';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import Button from '../utils/Button';
import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from '@/utils/multiplayer/multiplayerTypes';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS);

  useKeyPress('Escape', onClose, true);
  usePreventBackgroundScrolling(true);

  function handleCreate() {
    const id = nanoid(8);
    const params = new URLSearchParams();
    if (settings.timerEnabled) params.set('timer', '1');
    params.set('allowSpectators', settings.allowSpectators ? '1' : '0');
    params.set('isPrivateGame', settings.isPrivateGame ? '1' : '0');
    if (settings.pointSystem !== 'number')
      params.set('points', settings.pointSystem);
    if (settings.bestOfSeries !== 'off')
      params.set('series', settings.bestOfSeries);
    params.set('boardSize', settings.boardSize);
    const query = params.toString();
    router.push(`/multiplayer/${id}${query ? `?${query}` : ''}`);
    onClose();
  }

  return createPortal(
    <div>
      {/* Backdrop */}
      <div className="fixed inset-0 z-98 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create room settings"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2
          w-[90vw] max-w-sm
          bg-amber-50 dark:bg-amber-950
          border-2 border-amber-800 dark:border-amber-700
          rounded-xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh]"
      >
        <h2 className="text-lg font-black text-amber-700 dark:text-yellow-400 text-center tracking-wide shrink-0">
          🏴‍☠️ Room Settings
        </h2>

        <div className="flex flex-col gap-5 overflow-y-auto min-h-0">
          {/* Sand timer */}
          <label
            className="flex items-center justify-between cursor-pointer select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Sand timer (10s)
            <input
              type="checkbox"
              className="w-5 h-5 cursor-pointer accent-amber-600"
              checked={settings.timerEnabled}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  timerEnabled: e.target.checked,
                }))
              }
            />
          </label>

          {/* Private game */}
          <label
            className="flex items-center justify-between cursor-pointer select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Private game
            <input
              type="checkbox"
              className="w-5 h-5 cursor-pointer accent-amber-600"
              checked={settings.isPrivateGame}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  isPrivateGame: e.target.checked,
                }))
              }
            />
          </label>

          {/* Point system */}
          <label
            className="flex items-center justify-between select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Point system
            <select
              className="border-2 border-slate-300 dark:border-amber-700 rounded-md
              text-slate-800 dark:text-yellow-300 bg-white dark:bg-amber-900
              cursor-pointer px-2 py-1"
              value={settings.pointSystem}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pointSystem: e.target.value as RoomSettings['pointSystem'],
                }))
              }
            >
              <option value="number">Number</option>
              <option value="treasureChest">Treasure Chest</option>
            </select>
          </label>

          {/* Best of Series */}
          <label
            className="flex items-center justify-between select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Best of Series
            <select
              className="border-2 border-slate-300 dark:border-amber-700 rounded-md
              text-slate-800 dark:text-yellow-300 bg-white dark:bg-amber-900
              cursor-pointer px-2 py-1"
              value={settings.bestOfSeries}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bestOfSeries: e.target.value as RoomSettings['bestOfSeries'],
                }))
              }
            >
              <option value="off">Off</option>
              <option value="bo3">Best of 3</option>
              <option value="bo5">Best of 5</option>
            </select>
          </label>
          {/* Allow Spectators */}
          <label
            className="flex items-center justify-between cursor-pointer select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Allow spectators
            <input
              type="checkbox"
              className="w-5 h-5 cursor-pointer accent-amber-600"
              checked={settings.allowSpectators}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  allowSpectators: e.target.checked,
                }))
              }
            />
          </label>

          {/* Size of Board */}
          <label
            className="flex items-center justify-between select-none
          text-slate-700 dark:text-yellow-300 font-semibold"
          >
            Board Size
            <select
              className="border-2 border-slate-300 dark:border-amber-700 rounded-md
              text-slate-800 dark:text-yellow-300 bg-white dark:bg-amber-900
              cursor-pointer px-2 py-1"
              value={settings.boardSize}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  boardSize: e.target.value as RoomSettings['boardSize'],
                }))
              }
            >
              <option value="3">3x3</option>
              <option value="5">5x5</option>
              <option value="10">10x10</option>
            </select>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 shrink-0">
          <Button className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-500 border-amber-800
              dark:bg-amber-700 dark:hover:bg-amber-600 dark:border-yellow-500
              dark:text-yellow-300 text-white"
            onClick={handleCreate}
          >
            ⚓ Set Sail!
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
