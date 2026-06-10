// components/settings/IconPickerModal.tsx

import { createPortal } from 'react-dom';
import Button from '../utils/Button';
import { useKeyPress } from '@/hooks/useKeyPress';

export const ICON_LIST = [
  '🏴‍☠️',
  '⚓',
  '💰',
  '🦜',
  '🌊',
  '⭐️',
  '💀',
  '🦑',
  '🌑',
  '🪦',
  '☠️',
  '🗡️',
  '🪙',
  '💎',
  '🍺',
  '🔱',
];

export function IconPickerModal({
  showModal,
  setPlayer,
  player,
  otherPlayer,
  onClose,
}: {
  showModal: boolean;
  setPlayer: (value: { icon: string; name: string }) => void;
  player: { icon: string; name: string };
  otherPlayer: { icon: string; name: string };
  onClose: () => void;
}) {
  useKeyPress('Escape', onClose, showModal);

  if (!showModal) return null;

  return createPortal(
    <div>
      <div className="fixed inset-0 z-100 bg-black/70" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 z-101 w-64 max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-slate-300 bg-white p-4 shadow-2xl dark:border-red-700 dark:bg-red-950">
        <h3 className="mb-3 text-center text-sm font-bold tracking-wider text-slate-700 uppercase dark:text-yellow-300">
          Choose Your Icon
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ICON_LIST.map((icon, index) => (
            <Button
              key={`icon_${index}`}
              variant="unstyled"
              onClick={() => {
                setPlayer({ ...player, icon });
                onClose();
              }}
              disabled={player.icon === icon || otherPlayer.icon === icon}
              className={`aspect-square w-full border-2 text-3xl ${
                player.icon === icon || otherPlayer.icon === icon
                  ? 'scale-110 cursor-not-allowed border-amber-500 bg-amber-50 shadow-md disabled:opacity-100 dark:bg-amber-900/40'
                  : 'border-slate-200 bg-white hover:scale-105 hover:border-amber-400 hover:bg-amber-50 dark:border-red-700 dark:bg-red-900 dark:hover:bg-red-800'
              }`}
            >
              {icon}
            </Button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm dark:border-red-600 dark:bg-red-800 dark:hover:bg-red-700"
        >
          ✕ Cancel
        </Button>
      </div>
    </div>,
    document.body,
  );
}
