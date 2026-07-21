import { useId } from 'react';
import { ErrorWindowModal } from '../../indexTypes';
import WindowFrame from './WindowFrame';
import { XP_BUTTON } from './xpStyles';

type Props = {
  modal: ErrorWindowModal;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
};

// XP's message box error icon. Drawn inline rather than imported as an image
// because it is the only place the desktop needs it.
function ErrorIcon() {
  // Multiple error dialogs can be open at once, and duplicate ids in one document
  // are invalid, so the gradient gets a per-instance one.
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      width={32}
      height={32}
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#f98d8d" />
          <stop offset="55%" stopColor="#d92b2b" />
          <stop offset="100%" stopColor="#8b0f0f" />
        </radialGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill={`url(#${gradientId})`}
        stroke="#7a0d0d"
      />
      <path
        d="M11 11 L21 21 M21 11 L11 21"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// An XP message box. It can be moved and closed, and nothing else. Passing
// WindowFrame with no resize/minimize/maximize handlers is what makes its edges
// fixed and leaves the title bar with just a close button.
export default function ErrorWindow({
  modal,
  onClose,
  onFocus,
  onMove,
}: Props) {
  return (
    <WindowFrame
      modal={modal}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-[#f0efe7] text-black">
        <div className="flex flex-1 items-center gap-3 overflow-y-auto px-4 py-3">
          <ErrorIcon />
          <p className="text-xs leading-relaxed whitespace-pre-line">
            {modal.message}
          </p>
        </div>
        <div className="flex shrink-0 justify-center pb-3">
          <button
            type="button"
            autoFocus
            onClick={() => onClose(modal.uuid)}
            className={XP_BUTTON}
          >
            OK
          </button>
        </div>
      </div>
    </WindowFrame>
  );
}
