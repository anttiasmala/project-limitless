// components/settings/IconPickerModal.tsx

import { createPortal } from 'react-dom';
import Button from '../utils/Button';

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
  if (!showModal) return null;

  return createPortal(
    <div>
      <div className="fixed inset-0 z-100 bg-black/70" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 bg-white dark:bg-red-950 border-2 border-slate-300 dark:border-red-700 rounded-xl p-4 shadow-2xl w-64 max-w-[90vw]">
        <h3 className="text-center font-bold text-slate-700 dark:text-yellow-300 mb-3 text-sm uppercase tracking-wider">
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
              className={`text-3xl w-full aspect-square border-2 ${
                player.icon === icon || otherPlayer.icon === icon
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 scale-110 shadow-md cursor-not-allowed disabled:opacity-100'
                  : 'border-slate-200 dark:border-red-700 bg-white dark:bg-red-900 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-red-800 hover:scale-105'
              }`}
            >
              {icon}
            </Button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={onClose}
          className="mt-3 w-full py-2 dark:bg-red-800 dark:hover:bg-red-700 dark:border-red-600 text-sm"
        >
          ✕ Cancel
        </Button>
      </div>
    </div>,
    document.body,
  );
}
