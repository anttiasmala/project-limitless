import Button from '@/components/utils/Button';
import ConfirmModal from '@/components/utils/ConfirmModal';
import { Modal } from '@/components/utils/Modal';
import SvgDocument from '@/icons/document';
import SvgPencilSquare from '@/icons/pencil_square';
import SvgTrashCan from '@/icons/trash_can';
import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from '@/utils/multiplayer/multiplayerTypes';
import { useState } from 'react';
import { toast } from 'react-toastify';
import PresetModal from './PresetModal';
import { PresetType } from './presetTypes';
import { usePresets } from './usePresets';
import ViewPresetModal from './ViewPresetModal';

// One value instead of several booleans, so two child modals can never be open
// at once and the selected preset always travels with the open mode.
type View =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'delete'; preset: PresetType }
  | { mode: 'edit'; preset: PresetType }
  | { mode: 'view'; preset: PresetType };

type Props = {
  onClose: () => void;
  /** Loads the chosen preset's settings into the Create Room form. */
  applySettings: (settings: RoomSettings) => void;
};

export default function SettingPresets({ onClose, applySettings }: Props) {
  const { presets, addPreset, updatePreset, removePreset } = usePresets();
  const [view, setView] = useState<View>({ mode: 'list' });

  function handleApply(preset: PresetType) {
    applySettings(preset.settings);
    toast(`Loaded preset "${preset.name}"`);
    onClose();
  }

  function handleDelete(preset: PresetType) {
    removePreset(preset.id);
    toast('Preset deleted');
  }

  return (
    <Modal
      overlayClassName="z-105"
      className="z-106"
      ariaLabel="Preset modal"
      onClose={onClose}
      open
      lockScroll={false}
      closeOnEscape={view.mode === 'list'}
    >
      <div className="flex max-h-[90vh] w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <h2 className="shrink-0 text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
          🏴‍☠️ Saved Presets
        </h2>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto text-slate-700 dark:text-yellow-300">
          {presets.length === 0 && (
            <p className="text-center font-semibold">
              No presets yet — create a new one!
            </p>
          )}
          {presets.map((preset, index) => (
            <div
              key={preset.id ?? index}
              className="flex items-center justify-between gap-2 rounded-lg border-2 border-amber-800/40 bg-white px-3 py-2 dark:border-amber-700/60 dark:bg-amber-900"
            >
              <p className="min-w-0 flex-1 truncate font-bold">{preset.name}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  aria-label="Apply preset"
                  title="Apply preset"
                  onClick={() => handleApply(preset)}
                >
                  Apply
                </Button>
                <Button
                  aria-label="View preset"
                  title="View preset"
                  variant="unstyled"
                  onClick={() => setView({ mode: 'view', preset })}
                >
                  <SvgDocument className="h-6 w-6" />
                </Button>
                <Button
                  aria-label="Edit preset"
                  title="Edit preset"
                  variant="unstyled"
                  onClick={() => setView({ mode: 'edit', preset })}
                >
                  <SvgPencilSquare className="h-6 w-6" />
                </Button>
                {/* Divider keeps the destructive Delete apart from Edit so it
                    isn't fat-fingered. */}
                <span
                  aria-hidden
                  className="mx-0.5 h-6 w-px self-center bg-amber-800/30 dark:bg-amber-700/50"
                />
                <Button
                  aria-label="Delete preset"
                  title="Delete preset"
                  variant="unstyled"
                  className="text-red-600 dark:text-red-400"
                  onClick={() => setView({ mode: 'delete', preset })}
                >
                  <SvgTrashCan className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 gap-3 pt-2">
          <Button
            aria-label="Create new Preset"
            className="min-w-0 flex-1 border-amber-800 bg-amber-600 px-0 py-3 text-sm text-white hover:bg-amber-500 sm:px-0 sm:py-3 sm:text-base dark:border-yellow-500 dark:bg-amber-700 dark:text-yellow-300 dark:hover:bg-amber-600"
            onClick={() => setView({ mode: 'create' })}
            size="sm"
          >
            Create new Preset
          </Button>
          <Button
            variant="gold"
            onClick={onClose}
            className="min-w-0 flex-1 px-0 py-3 text-sm tracking-wide focus-visible:ring-4 sm:px-0 sm:py-3 sm:text-base dark:border-yellow-400 dark:bg-yellow-600 dark:text-black dark:hover:bg-yellow-500"
            size="sm"
          >
            ⚓ Close Window ☠️
          </Button>
        </div>

        {/* Creation Modal */}
        {view.mode === 'create' && (
          <PresetModal
            showModal
            onClose={() => setView({ mode: 'list' })}
            initialSettings={DEFAULT_ROOM_SETTINGS}
            onSave={(name, settings) => {
              addPreset(name, settings);
              toast('Preset created!');
            }}
          />
        )}

        {/* Edit Modal */}
        {view.mode === 'edit' && (
          <PresetModal
            showModal
            onClose={() => setView({ mode: 'list' })}
            initialSettings={view.preset.settings}
            initialName={view.preset.name}
            createOrEdit="Edit"
            onSave={(name, settings) => {
              updatePreset(view.preset.id, name, settings);
              toast('Preset updated!');
            }}
          />
        )}

        {/* View Modal */}
        {view.mode === 'view' && (
          <ViewPresetModal
            showModal
            settings={view.preset.settings}
            presetName={view.preset.name}
            onClose={() => setView({ mode: 'list' })}
          />
        )}

        {/* Delete confirmation */}
        {view.mode === 'delete' && (
          <ConfirmModal
            open
            title={<>Delete preset “{view.preset.name}”?</>}
            confirmLabel="Delete"
            onConfirm={() => {
              handleDelete(view.preset);
              setView({ mode: 'list' });
            }}
            onCancel={() => setView({ mode: 'list' })}
            lockScroll={false}
            overlayClassName="z-107"
            className="z-108"
          />
        )}
      </div>
    </Modal>
  );
}
