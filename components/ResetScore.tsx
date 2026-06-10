// components/ResetScore.tsx

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './utils/Button';
import { useKeyPress } from '@/hooks/useKeyPress';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';

type ResetScoreProps = {
  onReset: () => void;
};

export default function ResetScore({ onReset }: ResetScoreProps) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  return (
    <div>
      <ConfirmationModal
        onClose={() => setShowConfirmationModal(false)}
        showConfirmationModal={showConfirmationModal}
        onReset={onReset}
      />
      <Button
        variant="neutral"
        size="md"
        onClick={() => setShowConfirmationModal(true)}
        className="rounded-2xl p-2 shadow-[0_0_40px_#94a3b820] backdrop-blur-sm dark:shadow-[0_0_40px_#451a0360]"
      >
        Reset Score
      </Button>
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
  useKeyPress('Escape', onClose, showConfirmationModal);
  useKeyPress(
    'Enter',
    (e) => {
      // Stop the focused button (e.g. the "Reset Score" trigger) from being
      // re-activated by Enter, which would reopen the modal we just closed.
      e.preventDefault();
      onReset();
      onClose();
    },
    showConfirmationModal,
  );
  usePreventBackgroundScrolling(showConfirmationModal);

  if (!showConfirmationModal) return null;
  return createPortal(
    <div>
      <div
        className="fixed top-0 left-0 z-98 h-full w-full bg-black opacity-80"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reset score confirmation"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-slate-300 bg-white p-6 dark:border-red-700 dark:bg-red-900">
          <p className="text-center font-bold text-slate-800 dark:text-yellow-300">
            Reset Score?
          </p>
          <div className="flex gap-4">
            <Button onClick={onClose}>No</Button>
            <Button
              autoFocus
              className="bg-green-600 hover:bg-green-500 dark:border-green-600 dark:bg-green-600 dark:hover:bg-green-500"
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
