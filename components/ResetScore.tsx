// components/ResetScore.tsx

'use client';

import { useState } from 'react';
import Button from './utils/Button';
import { Modal } from './utils/Modal';
import { useKeyPress } from '@/hooks/useKeyPress';

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

  return (
    <Modal
      open={showConfirmationModal}
      onClose={onClose}
      ariaLabel="Reset score confirmation"
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
    </Modal>
  );
}
