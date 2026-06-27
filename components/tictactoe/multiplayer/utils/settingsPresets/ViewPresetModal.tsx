import Button from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import VictoriesInfoModal from '@/components/tictactoe/VictoriesInfoModal';
import { RoomSettings } from '@/utils/tictactoe/multiplayer/multiplayerTypes';
import { ReactNode, useState } from 'react';

type Props = {
  showModal: boolean;
  settings: RoomSettings;
  presetName: string;
  onClose: () => void;
};

const BOARD_SIZE_LABELS: Record<RoomSettings['boardSize'], string> = {
  '3': '3x3',
  '5': '5x5',
  '10': '10x10',
};

const BEST_OF_SERIES_LABELS: Record<RoomSettings['bestOfSeries'], string> = {
  off: 'Off',
  bo3: 'Best of 3',
  bo5: 'Best of 5',
};

function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-amber-800/40 px-3 py-1.5 dark:border-amber-700/60">
      <span className="font-bold">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default function ViewPresetModal({
  showModal,
  settings,
  presetName,
  onClose,
}: Props) {
  const [showVictoriesInfoModal, setShowVictoriesInfoModal] = useState(false);

  return (
    <Modal
      overlayClassName="z-107 bg-black"
      className="z-108"
      ariaLabel="Preset viewing modal"
      onClose={onClose}
      open={showModal}
      lockScroll={false}
      closeOnEscape={!showVictoriesInfoModal}
    >
      <div className="flex max-h-[90vh] w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <h2 className="shrink-0 text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
          🏴‍☠️ Preset Details
        </h2>

        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto font-semibold text-slate-700 dark:text-yellow-300">
          <Row label="Preset name" value={presetName} />
          <Row label="Board Size" value={BOARD_SIZE_LABELS[settings.boardSize]} />
          <Row
            label="Best of Series"
            value={BEST_OF_SERIES_LABELS[settings.bestOfSeries]}
          />
          <Row
            label={
              <span className="inline-flex items-center">
                Victories
                <button
                  type="button"
                  aria-label="What does Victories mean?"
                  title="What does Victories mean?"
                  className="ml-1 cursor-pointer leading-none"
                  onClick={() => setShowVictoriesInfoModal(true)}
                >
                  ℹ️
                </button>
              </span>
            }
            value={
              settings.victoriesForAction === 0
                ? 'Unlimited'
                : settings.victoriesForAction
            }
          />
          <Row
            label="Sand timer"
            value={
              settings.timerEnabled
                ? `On (${settings.timerDuration}s/turn)`
                : 'Off'
            }
          />
          <Row
            label="Private game"
            value={settings.isPrivateGame ? 'Yes' : 'No'}
          />
          {settings.isPrivateGame && (
            <Row label="Password" value={settings.password || '—'} />
          )}
          <Row
            label="Allow spectators"
            value={settings.allowSpectators ? 'Yes' : 'No'}
          />
        </div>

        <Button
          variant="gold"
          onClick={onClose}
          className="shrink-0 text-base tracking-wide focus-visible:ring-4 dark:border-yellow-400 dark:bg-yellow-600 dark:text-black dark:hover:bg-yellow-500"
        >
          ⚓ Close Window ☠️
        </Button>

        <VictoriesInfoModal
          onClose={() => setShowVictoriesInfoModal(false)}
          showModal={showVictoriesInfoModal}
          overlayClassName="z-110"
          className="z-111"
        />
      </div>
    </Modal>
  );
}
