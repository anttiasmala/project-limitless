import NumberInput from '@/components/shared/NumberInput';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import VictoriesInfoModal from '@/components/tictactoe/VictoriesInfoModal';
import SvgCopy from '@/icons/copy';
import SvgEyeOpen from '@/icons/eye_open';
import SvgEyeSlash from '@/icons/eye_slash';
import SvgReload from '@/icons/reload';
import {
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from '@/utils/multiplayer/multiplayerTypes';
import { generateString } from '@/utils/utils';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/shared/Button';

type Props = {
  settings: RoomSettings;
  setSettings: Dispatch<SetStateAction<RoomSettings>>;
  /**
   * Notifies the parent when the nested Victories-info modal opens or closes so
   * the parent can gate its own Escape-to-close behavior.
   */
  onNestedModalOpenChange?: (open: boolean) => void;
  /** z-index/styling overrides for the nested Victories-info modal. */
  victoriesInfoOverlayClassName?: string;
  victoriesInfoClassName?: string;
  /**
   * Extra content rendered at the top of the form's scroll container (e.g. the
   * preset-name field). Placing it here keeps it inside the single scroll area
   * instead of pinned above it.
   */
  leadingContent?: ReactNode;
};

// The shared Room Settings form, rendered by both the Create Room modal and the
// preset Create/Edit modal so the two can't drift apart. It owns only the UI
// state that's local to the form (password visibility, the Victories info
// modal); the settings themselves live in the parent.
export default function RoomSettingsForm({
  settings,
  setSettings,
  onNestedModalOpenChange,
  victoriesInfoOverlayClassName,
  victoriesInfoClassName,
  leadingContent,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showVictoriesInfoModal, setShowVictoriesInfoModal] = useState(false);

  function setVictoriesInfo(open: boolean) {
    setShowVictoriesInfoModal(open);
    onNestedModalOpenChange?.(open);
  }

  return (
    <div className="flex min-h-0 flex-col gap-5 overflow-y-auto font-semibold text-slate-700 dark:text-yellow-300">
      {leadingContent}

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
            onClick={() => setVictoriesInfo(true)}
          >
            ℹ️
          </button>
        </div>
        <NumberInput
          aria-label="Victories"
          min={0}
          className="ml-1 w-12 px-1 dark:border-amber-700 dark:bg-amber-900"
          value={settings.victoriesForAction}
          fallback={DEFAULT_ROOM_SETTINGS.victoriesForAction}
          onCommit={(val) =>
            setSettings((prev) => ({ ...prev, victoriesForAction: val }))
          }
        />
      </div>

      <VictoriesInfoModal
        overlayClassName={victoriesInfoOverlayClassName}
        className={victoriesInfoClassName}
        onClose={() => setVictoriesInfo(false)}
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
            <NumberInput
              aria-label="Seconds per turn"
              min={1}
              className="ml-1 w-12 px-1 dark:border-amber-700 dark:bg-amber-900"
              value={settings.timerDuration}
              fallback={DEFAULT_ROOM_SETTINGS.timerDuration}
              onCommit={(val) =>
                setSettings((prev) => ({ ...prev, timerDuration: val }))
              }
            />
          </div>
        )}
      </div>

      {/* Private game */}
      <div>
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
                password: '',
              }))
            }
          />
        </label>
        {settings.isPrivateGame && (
          <div className="ml-4">
            <label className="mb-1 block">Password</label>
            <div className="flex items-center gap-1 rounded-lg border-2 border-slate-300 bg-white pr-1 text-lg font-bold text-slate-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400 dark:border-amber-700 dark:bg-amber-900 dark:text-yellow-300">
              <input
                aria-label="Password input"
                className="min-w-0 flex-1 px-2 focus:outline-0"
                autoComplete="off"
                value={settings.password ?? ''}
                type={showPassword ? 'text' : 'password'}
                onChange={(e) =>
                  setSettings((prevValue) => ({
                    ...prevValue,
                    password: e.target.value,
                  }))
                }
              />
              <Button
                aria-label="Show or hide password"
                variant="unstyled"
                onClick={() => setShowPassword((prevValue) => !prevValue)}
                title="Show or hide password"
              >
                {showPassword ? (
                  <SvgEyeSlash className="h-8 w-8" />
                ) : (
                  <SvgEyeOpen className="h-8 w-8" />
                )}
              </Button>
              <Button
                variant="unstyled"
                aria-label="Copy the password"
                title="Copy the password"
                onClick={() => {
                  navigator.clipboard
                    .writeText(settings.password ?? '')
                    .then(() => toast('Password copied to clipboard!'))
                    .catch(() => toast('Could not copy password'));
                }}
              >
                <SvgCopy className="h-8 w-8" />
              </Button>
              <Button
                variant="unstyled"
                aria-label="Generate random password"
                title="Generate random password"
                onClick={() => {
                  const randomString = generateString(5);
                  setSettings((prevValue) => ({
                    ...prevValue,
                    password: randomString,
                  }));
                  toast('Random password generated!');
                }}
              >
                <SvgReload className="h-8 w-8" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
  );
}
