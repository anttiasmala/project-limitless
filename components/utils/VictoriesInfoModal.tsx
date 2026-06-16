// components/utils/VictoriesInfoModal.tsx

import Button from '@/components/utils/Button';
import { Modal } from '@/components/utils/Modal';

type Props = {
  onClose: () => void;
  showModal: boolean;
};

export default function VictoriesInfoModal({ onClose, showModal }: Props) {
  return (
    <Modal
      open={showModal}
      onClose={onClose}
      ariaLabel="Victories setting information"
      lockScroll={false}
      overlayClassName="z-101"
    >
      <div className="flex max-h-[90dvh] w-72 max-w-[90vw] flex-col overflow-y-auto rounded-lg border-2 border-slate-300 bg-white p-4 text-slate-800 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300">
        <h3 className="mb-3 text-center text-sm font-bold tracking-wider uppercase">
          Victories
        </h3>
        <p className="font-normal">
          How many wins a player needs before one of the following happens:
        </p>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 font-normal">
          <li>
            When <b>Best of Series</b> is on, the winner earns one series point.
          </li>
          <li>
            When <b>Best of Series</b> is off, all scores reset.
          </li>
          <li>
            Setting it to <b>0</b> means{' '}
            <span className="font-bold text-amber-600 dark:text-yellow-300">
              unlimited
            </span>{' '}
            — scores never reset and no series points are awarded.
          </li>
        </ul>
        <Button
          variant="primary"
          className="mt-4 w-full shrink-0 py-2 text-sm tracking-wide"
          onClick={onClose}
        >
          ⚓ Close Window ☠️
        </Button>
      </div>
    </Modal>
  );
}
