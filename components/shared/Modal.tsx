// components/utils/Modal.tsx

'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useKeyPress } from '@/hooks/useKeyPress';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';

type ModalProps = {
  /** Whether the modal is shown. When false, nothing is rendered. */
  open: boolean;
  /** Called when the user dismisses the modal (Escape or backdrop click). */
  onClose: () => void;
  /** Accessible label for the dialog. */
  ariaLabel: string;
  /** The modal card / content. Bring your own styling, width and theming. */
  children: ReactNode;
  /**
   * Close when the empty area around the card is clicked. Default true.
   * Set false for modals that must be dismissed explicitly (e.g. game over).
   */
  closeOnBackdrop?: boolean;
  /**
   * Close on the Escape key. Default true. Pass `false` while a nested modal
   * is open so Escape closes the child first, not this one.
   */
  closeOnEscape?: boolean;
  /**
   * Lock background page scrolling while open. Default true. Pass `false` for
   * modals nested inside another (already-locked) modal — otherwise closing
   * the child would unlock scrolling while the parent is still open.
   */
  lockScroll?: boolean;
  /** Override the backdrop styling (merged over the default dark overlay). */
  overlayClassName?: string;
  /** Extra classes on the centering container (the dialog element). */
  className?: string;
};

/**
 * Shared modal shell: handles the portal, dark backdrop, background scroll
 * lock, Escape-to-close, click-outside-to-close, centering and the dialog
 * ARIA roles. Render your bespoke card as `children` — the shell is
 * intentionally unopinionated about width, borders and theming.
 */
export function Modal({
  open,
  onClose,
  ariaLabel,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  lockScroll = true,
  overlayClassName,
  className,
}: ModalProps) {
  useKeyPress('Escape', onClose, open && closeOnEscape);
  usePreventBackgroundScrolling(open && lockScroll);

  if (!open) return null;

  return createPortal(
    <div>
      <div
        className={twMerge('fixed inset-0 z-100 bg-black/80', overlayClassName)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={twMerge(
          'fixed inset-0 z-101 flex items-center justify-center overflow-y-auto p-4',
          className,
        )}
        onClick={
          closeOnBackdrop
            ? (e) => {
                if (e.target === e.currentTarget) onClose();
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
