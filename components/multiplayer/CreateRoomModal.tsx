// components/multiplayer/CreateRoomModal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import Button from '../utils/Button';
import { Modal } from '../utils/Modal';
import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from '@/utils/multiplayer/multiplayerTypes';
import Input from '../utils/Input';
import VictoriesInfoModal from '../utils/VictoriesInfoModal';
import ToggleSwitch from '../utils/ToggleSwitch';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS);
  const [showVictoriesInfoModal, setShowVictoriesInfoModal] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  function handleCreate() {
    const id = nanoid(8);
    const params = new URLSearchParams();
    if (settings.timerEnabled) {
      params.set('timer', '1');
      params.set('timerDuration', settings.timerDuration.toString());
    }
    params.set('victories', settings.victoriesForAction.toString());

    params.set('allowSpectators', settings.allowSpectators ? '1' : '0');
    params.set('isPrivateGame', settings.isPrivateGame ? '1' : '0');
    if (settings.bestOfSeries !== 'off')
      params.set('series', settings.bestOfSeries);
    params.set('boardSize', settings.boardSize);
    const query = params.toString();
    router.push(`/multiplayer/${id}${query ? `?${query}` : ''}`);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel="Create room settings"
      // While the Victories info modal is open, Escape should close it first.
      closeOnEscape={!isAnyModalOpen}
    >
      <div className="flex max-h-[90vh] w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <h2 className="shrink-0 text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
          🏴‍☠️ Room Settings
        </h2>
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto font-semibold text-slate-700 dark:text-yellow-300">
          {/* Board Size */}
          <label className="flex items-center justify-between select-none">
            Board Size
            <select
              className="cursor-pointer rounded-md border-2 border-slate-300 bg-white px-2 py-1 text-slate-800 dark:border-amber-700 dark:bg-amber-900 dark:text-yellow-300"
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

          {/* Best of Series */}
          <label className="flex items-center justify-between select-none">
            Best of Series
            <select
              className="cursor-pointer rounded-md border-2 border-slate-300 bg-white px-2 py-1 text-slate-800 dark:border-amber-700 dark:bg-amber-900 dark:text-yellow-300"
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

          {/* Victories */}

          <div className="flex items-center justify-between">
            <div>
              <label>Victories</label>
              <button
                type="button"
                aria-label="What does Victories mean?"
                title="What does Victories mean?"
                className="ml-1 cursor-pointer leading-none"
                onClick={() => {
                  setShowVictoriesInfoModal(true);
                  setIsAnyModalOpen(true);
                }}
              >
                ℹ️
              </button>
            </div>
            <Input
              type="number"
              min={0}
              className="ml-1 w-12 px-1 dark:border-amber-700 dark:bg-amber-900"
              defaultValue={settings.victoriesForAction}
              onBlur={(e) => {
                const val = Number(e.target.value);
                if (Number.isFinite(val) && val >= 0) {
                  setSettings((prev) => ({
                    ...prev,
                    victoriesForAction: val,
                  }));
                  // Re-sync the field so e.g. an empty input shows "0" and "05" shows "5"
                  e.target.value = String(val);
                } else {
                  setSettings((prev) => ({
                    ...prev,
                    victoriesForAction:
                      DEFAULT_ROOM_SETTINGS.victoriesForAction,
                  }));
                  e.target.value = String(
                    DEFAULT_ROOM_SETTINGS.victoriesForAction,
                  );
                }
              }}
            />
          </div>

          <VictoriesInfoModal
            onClose={() => {
              setShowVictoriesInfoModal(false);
              setIsAnyModalOpen(false);
            }}
            showModal={showVictoriesInfoModal}
          />

          {/* Sand timer */}
          <div>
            <label className="flex cursor-pointer items-center justify-between select-none">
              Sand timer
              <ToggleSwitch
                size="sm"
                className="dark:rounded-md dark:border dark:border-amber-700/50"
                checked={settings.timerEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    timerEnabled: e.target.checked,
                  }))
                }
              />
            </label>
            {settings.timerEnabled && (
              <div className="ml-4">
                <label>Seconds per turn</label>
                <Input
                  type="number"
                  min={1}
                  defaultValue={settings.timerDuration}
                  className="ml-1 w-12 px-1 dark:border-amber-700 dark:bg-amber-900"
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (Number.isFinite(val) && val >= 1) {
                      setSettings((prev) => ({
                        ...prev,
                        timerDuration: val,
                      }));
                      // Re-sync the field so e.g. a typed "05" shows as "5"
                      e.target.value = String(val);
                    } else {
                      setSettings((prev) => ({
                        ...prev,
                        timerDuration: DEFAULT_ROOM_SETTINGS.timerDuration,
                      }));
                      e.target.value = String(
                        DEFAULT_ROOM_SETTINGS.timerDuration,
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Private game */}
          <label className="flex cursor-pointer items-center justify-between select-none">
            Private game
            <ToggleSwitch
              size="sm"
              className="dark:rounded-md dark:border dark:border-amber-700/50"
              checked={settings.isPrivateGame}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  isPrivateGame: e.target.checked,
                }))
              }
            />
          </label>
          {/* Allow spectators */}
          <label className="flex cursor-pointer items-center justify-between select-none">
            Allow spectators
            <ToggleSwitch
              size="sm"
              className="dark:rounded-md dark:border dark:border-amber-700/50"
              checked={settings.allowSpectators}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  allowSpectators: e.target.checked,
                }))
              }
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex shrink-0 gap-3 pt-2">
          <Button
            className="flex-1 py-0 text-sm whitespace-nowrap sm:py-3 sm:text-lg"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 border-amber-800 bg-amber-600 py-0 text-sm whitespace-nowrap text-white hover:bg-amber-500 sm:py-3 sm:text-lg dark:border-yellow-500 dark:bg-amber-700 dark:text-yellow-300 dark:hover:bg-amber-600"
            onClick={handleCreate}
          >
            ⚓ Set Sail!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
