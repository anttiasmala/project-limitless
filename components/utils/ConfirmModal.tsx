import Button, { ButtonVariant } from '@/components/utils/Button';
import { Modal } from '@/components/utils/Modal';
import { ReactNode } from 'react';

type Props = {
  open: boolean;
  /** Heading / question, e.g. 'Delete preset "X"?'. */
  title: ReactNode;
  /** Optional supporting line under the title. */
  description?: ReactNode;
  /** Confirm-button label. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Cancel-button label. Defaults to 'Cancel'. */
  cancelLabel?: string;
  /** Visual style of the confirm button. Defaults to 'primary'. */
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
  /** Pass false when nested inside another already-scroll-locked modal. */
  lockScroll?: boolean;
  overlayClassName?: string;
  className?: string;
};

// A small yes/no confirmation dialog. Cancel is focused by default so an
// accidental Enter dismisses rather than commits the action.
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  lockScroll = true,
  overlayClassName,
  className,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      ariaLabel="Confirmation"
      lockScroll={lockScroll}
      overlayClassName={overlayClassName}
      className={className}
    >
      <div className="flex w-[90vw] max-w-xs flex-col items-center gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950">
        <div className="flex flex-col gap-1 text-center text-slate-800 dark:text-yellow-300">
          <p className="font-bold">{title}</p>
          {description && <p className="text-sm font-normal">{description}</p>}
        </div>
        <div className="flex w-full gap-3">
          <Button autoFocus variant="neutral" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
