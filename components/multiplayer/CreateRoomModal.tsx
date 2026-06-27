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
import SvgReload from '@/icons/reload';
import RoomSettingsForm from './RoomSettingsForm';
import SettingPresets from './utils/settingsPresets/SettingPresets';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS);
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);

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
    sessionStorage.setItem(`room-password:${id}`, settings.password ?? '');
    router.push(`/multiplayer/${id}${query ? `?${query}` : ''}`);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel="Create room settings"
      // While a nested modal (Victories info / Presets) is open, Escape should
      // close it first rather than the whole Create Room modal.
      closeOnEscape={!isNestedModalOpen && !showPresetModal}
    >
      <div className="flex max-h-[90vh] w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <div className="relative flex flex-row justify-center">
          <h2 className="shrink-0 text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
            🏴‍☠️ Room Settings
          </h2>
          <div className="relative ml-3">
            <Button
              size="sm"
              className="h-6 w-14"
              onClick={() => setShowPresetModal(true)}
            >
              Presets
            </Button>
            <Button
              className="group absolute -top-0.5 ml-3 rounded-full border border-slate-300 bg-slate-200 p-1 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:border-red-600 dark:bg-red-800 dark:hover:border-yellow-400 dark:hover:bg-red-700"
              aria-label="Reset game settings"
              title="Reset game settings"
              onClick={() => setSettings(DEFAULT_ROOM_SETTINGS)}
            >
              <SvgReload className="h-5 w-5 text-slate-800 dark:text-yellow-300" />
              <span className="pointer-events-none absolute top-full right-0 hidden rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                Reset game settings
              </span>
            </Button>
          </div>
        </div>

        <RoomSettingsForm
          settings={settings}
          setSettings={setSettings}
          onNestedModalOpenChange={setIsNestedModalOpen}
        />

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

        {showPresetModal && (
          <SettingPresets
            onClose={() => setShowPresetModal(false)}
            applySettings={(newSettings) => setSettings(newSettings)}
          />
        )}
      </div>
    </Modal>
  );
}
