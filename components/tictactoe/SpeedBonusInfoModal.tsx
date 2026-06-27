// components/utils/SpeedBonusInfoModal.tsx

import Button from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';

type Props = {
  onClose: () => void;
  showModal: boolean;
};

export default function SpeedBonusInfoModal({ onClose, showModal }: Props) {
  return (
    <Modal
      open={showModal}
      onClose={onClose}
      ariaLabel="Speed bonus setting information"
      lockScroll={false}
      overlayClassName="z-101"
    >
      <div className="flex max-h-[90dvh] w-72 max-w-[90vw] flex-col overflow-y-auto rounded-lg border-2 border-slate-300 bg-white p-4 text-slate-800 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300">
        <h3 className="mb-3 text-center text-sm font-bold tracking-wider uppercase">
          Speed bonus
        </h3>
        <p className="font-normal">
          Time-based scoring — win in fewer moves to plunder extra points:
        </p>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 font-normal">
          <li>
            Win in the <b>fewest moves possible</b> →{' '}
            <span className="font-bold text-amber-600 dark:text-yellow-300">
              3 points
            </span>
          </li>
          <li>
            Win in <b>one move more</b> →{' '}
            <span className="font-bold text-amber-600 dark:text-yellow-300">
              2 points
            </span>
          </li>
          <li>Any slower win → the usual 1 point.</li>
        </ul>
        <p className="mt-2 font-normal">
          Bonus points count toward <b>Victories</b> and <b>Best of Series</b>,
          so a swift raid fills your treasure faster.
        </p>
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
