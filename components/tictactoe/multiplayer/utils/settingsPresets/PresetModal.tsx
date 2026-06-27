import RoomSettingsForm from '@/components/tictactoe/multiplayer/RoomSettingsForm';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Modal } from '@/components/shared/Modal';
import SvgReload from '@/icons/reload';
import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from '@/utils/tictactoe/multiplayer/multiplayerTypes';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { nextPresetName, usePresets } from './usePresets';

type Props = {
  showModal: boolean;
  onClose: () => void;
  /** Settings the form starts from. For "Edit" this is the preset's settings. */
  initialSettings: RoomSettings;
  /** Preset name the form starts from (only meaningful when editing). */
  initialName?: string;
  /** Persists the preset. The parent decides whether this adds or updates. */
  onSave: (name: string, settings: RoomSettings) => void;
  createOrEdit?: 'Create' | 'Edit';
};

export default function PresetModal({
  showModal,
  initialSettings,
  initialName = 'Preset',
  onClose,
  onSave,
  createOrEdit = 'Create',
}: Props) {
  const { presets } = usePresets();
  const isCreate = createOrEdit === 'Create';
  const [settings, setSettings] = useState<RoomSettings>(initialSettings);
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  // Null until the user edits the field. While null we show a derived name: a
  // unique suggestion for new presets, or the existing name when editing. This
  // recomputes as the stored presets load, so no effect/sync is needed.
  const [typedName, setTypedName] = useState<string | null>(null);
  const presetName =
    typedName ??
    (isCreate ? nextPresetName(presets, initialName) : initialName);

  function handleSave() {
    const trimmedName = presetName.trim();
    if (trimmedName.length === 0) {
      toast('Please give the preset a name!');
      return;
    }
    onSave(trimmedName, settings);
    onClose();
  }

  return (
    <Modal
      overlayClassName="z-107 bg-black"
      className="z-108"
      ariaLabel="Preset creation modal"
      onClose={onClose}
      open={showModal}
      lockScroll={false}
      closeOnEscape={!isNestedModalOpen}
    >
      <div className="flex max-h-[90vh] w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <div className="relative flex justify-center">
          <h2 className="mb-3 shrink-0 text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
            🏴‍☠️ {createOrEdit === 'Create' ? 'Create new Preset' : 'Edit Preset'}{' '}
            🏴‍☠️
          </h2>
          <div className="absolute right-0">
            <Button
              className="group rounded-full border border-slate-300 bg-slate-200 p-1 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:border-red-600 dark:bg-red-800 dark:hover:border-yellow-400 dark:hover:bg-red-700"
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
          victoriesInfoOverlayClassName="z-110"
          victoriesInfoClassName="z-111"
          leadingContent={
            <label className="flex items-center justify-between font-bold text-slate-700 select-none dark:text-yellow-300">
              Preset name
              <Input
                value={presetName}
                onChange={(e) => setTypedName(e.target.value)}
                maxLength={20}
                className="ml-1 min-w-0 flex-1"
              />
            </label>
          }
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
            onClick={handleSave}
          >
            ⚓ {createOrEdit === 'Create' ? 'Create' : 'Save'} Preset!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
