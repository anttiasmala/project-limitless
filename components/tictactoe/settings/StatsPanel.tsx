// components/settings/StatsPanel.tsx

import { WinLossDrawStats } from '@/utils/types';
import { useState } from 'react';
import Button from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useKeyPress } from '@/hooks/useKeyPress';

function StatRow({
  icon,
  name,
  stats,
}: {
  icon: string;
  name: string;
  stats: { win: number; loss: number; draw: number };
}) {
  const total = stats.win + stats.loss + stats.draw;
  const winW = total === 0 ? 0 : (stats.win / total) * 100;
  const lossW = total === 0 ? 0 : (stats.loss / total) * 100;
  const drawW = total === 0 ? 0 : (stats.draw / total) * 100;

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center gap-1">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-bold text-slate-700 dark:text-yellow-300">
          {name}
        </span>
      </div>
      {total === 0 ? (
        <p className="text-xs text-slate-400 dark:text-red-300/60">
          No games recorded
        </p>
      ) : (
        <>
          <div className="mb-1 flex h-2 overflow-hidden rounded">
            <div className="bg-green-500" style={{ width: `${winW}%` }} />
            <div className="bg-red-500" style={{ width: `${lossW}%` }} />
            <div className="bg-yellow-400" style={{ width: `${drawW}%` }} />
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400">
              W {stats.win} ({Math.round(winW)}%)
            </span>
            <span className="text-red-600 dark:text-red-400">
              L {stats.loss} ({Math.round(lossW)}%)
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              D {stats.draw} ({Math.round(drawW)}%)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-red-300/60">
            {total} games total
          </p>
        </>
      )}
    </div>
  );
}

export function StatsPanel({
  winLossDraw,
  playerOne,
  playerTwo,
  onResetStats,
  setIsAnyModalOpen,
}: {
  winLossDraw: WinLossDrawStats;
  playerOne: { icon: string; name: string };
  playerTwo: { icon: string; name: string };
  onResetStats?: () => void;
  setIsAnyModalOpen: (value: boolean) => void;
}) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  return (
    <div className="w-72 max-w-[90vw] overflow-hidden rounded-lg border-2 border-slate-300 bg-white dark:border-red-700 dark:bg-red-900">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-red-700 dark:bg-red-800">
        <h3 className="text-center font-bold tracking-wide text-slate-700 dark:text-yellow-300">
          📊 Battle Record
        </h3>
      </div>
      <div className="p-4">
        <StatRow
          icon={playerOne.icon}
          name={playerOne.name}
          stats={winLossDraw['☠️']}
        />
        <StatRow
          icon={playerTwo.icon}
          name={playerTwo.name}
          stats={winLossDraw['⚓']}
        />
        {onResetStats && (
          <>
            <ConfirmationModal
              onClose={() => {
                setShowConfirmationModal(false);
                setIsAnyModalOpen(false);
              }}
              showConfirmationModal={showConfirmationModal}
              onReset={onResetStats}
            />
            <Button
              variant="unstyled"
              onClick={() => {
                setShowConfirmationModal(true);
                setIsAnyModalOpen(true);
              }}
              className="mt-1 w-full border-2 border-slate-300 bg-slate-200 py-2 text-xs text-slate-700 hover:border-amber-500 hover:bg-slate-300 hover:text-slate-900 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300/70 dark:hover:border-yellow-500 dark:hover:bg-red-800 dark:hover:text-yellow-300"
            >
              🗑️ Reset Stats
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmationModal({
  onClose,
  showConfirmationModal,
  onReset,
}: {
  onClose: () => void;
  showConfirmationModal: boolean;
  onReset: () => void;
}) {
  useKeyPress(
    'Enter',
    (e) => {
      e.preventDefault();
      onReset();
      onClose();
    },
    showConfirmationModal,
  );

  return (
    <Modal
      open={showConfirmationModal}
      onClose={onClose}
      ariaLabel="Reset stats confirmation"
      lockScroll={false}
      overlayClassName="z-101"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-slate-300 bg-white p-6 dark:border-red-700 dark:bg-red-900">
        <p className="text-center font-bold text-slate-800 dark:text-yellow-300">
          Reset Stats?
        </p>
        <div className="flex gap-4">
          <Button onClick={onClose}>No</Button>
          <Button
            autoFocus
            className="border-green-800 bg-green-600 hover:bg-green-500 dark:border-green-600 dark:bg-green-600 dark:hover:bg-green-500"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
