// components/ResetScore.tsx

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './utils/Button';

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
      <button
        onClick={() => setShowConfirmationModal(true)}
        className="cursor-pointer bg-slate-200 border-2 border-slate-400 text-slate-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 rounded-2xl p-2 shadow-[0_0_40px_#94a3b820] dark:shadow-[0_0_40px_#451a0360] backdrop-blur-sm hover:border-amber-500 hover:bg-slate-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/50 transition-all duration-200"
      >
        Reset Score
      </button>
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
        <div className="flex flex-col items-center gap-4 bg-white dark:bg-red-900 border-slate-300 dark:border-red-700 border-2 rounded-lg p-6">
          <p className="text-slate-800 dark:text-yellow-300 font-bold text-center">
            Reset Score?
          </p>
          <div className="flex gap-4">
            <Button onClick={onClose}>No</Button>
            <Button
              className="dark:bg-green-600 bg-green-600 hover:bg-green-500 dark:border-green-600 dark:hover:bg-green-500"
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
