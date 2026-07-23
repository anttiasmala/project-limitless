import Image from 'next/image';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Fixed dialog size, like the real Turn Off / Log Off box in Windows XP.
const DIALOG_WIDTH = 300;
const DIALOG_HEIGHT = 200;

// What the two dialogs need from their parent: a way to run one of their
// (placeholder) actions, and a way to dismiss themselves.
type DialogActions = {
  // Runs a named action: pops a "does not exist" message box, then closes.
  onAction: (name: string) => void;
  // Dismisses the dialog (Cancel button).
  onClose: () => void;
};

export default function ShutdownMenu({
  type,
  onClose,
  onOpenError,
}: {
  // Which flavor of the dialog to show. The two share the same chrome and only
  // differ in their title and the actions they offer.
  type: 'turnOffComputer' | 'logOff';
  // Opens a message box. Every action here is a placeholder, so they just
  // report that they don't exist, like the rest of this XP clone.
  onOpenError: (title: string, message: string) => void;
  onClose: () => void;
}) {
  // Esc cancels the dialog, like the modal Turn Off / Log Off box in Windows XP.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Rendered client-side only (createPortal needs document.body). This dialog
  // never appears during SSR anyway, since it only opens on a user click.
  if (typeof document === 'undefined') return null;

  // Every button is a placeholder, so they all resolve the same way: report the
  // feature is missing, then dismiss the dialog.
  const onAction = (name: string) => {
    onOpenError(name, `${name} does not exist`);
    onClose();
  };
  const actions = { onAction, onClose };

  return createPortal(
    // Full-screen backdrop rendered outside <main> (so the grayscale filter on
    // the desktop never touches it). It sits above everything and swallows all
    // pointer events, making the dialog modal: the desktop, folders and taskbar
    // can't be clicked while it is open, like in Windows XP.
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {type === 'logOff' ? <Logout {...actions} /> : <Shutdown {...actions} />}
    </div>,
    document.body,
  );
}

function Shutdown({ onAction, onClose }: DialogActions) {
  return (
    <DialogShell title="Turn off computer" onClose={onClose}>
      <ActionButton
        icon="/images/index-page/shutdown-menu/standby.png"
        label="Stand By"
        accelIndex={0}
        disabled
      />
      <ActionButton
        icon="/images/index-page/start-menu/shutdown.png"
        label="Turn Off"
        accelIndex={1}
        onClick={() => onAction('Shutdown')}
      />
      <ActionButton
        icon="/images/index-page/shutdown-menu/restart.ico"
        label="Restart"
        accelIndex={0}
        onClick={() => onAction('Restart')}
      />
    </DialogShell>
  );
}

function Logout({ onAction, onClose }: DialogActions) {
  return (
    <DialogShell title="Log Off Windows" onClose={onClose} gap="gap-12">
      <ActionButton
        icon="/images/index-page/shutdown-menu/switch-user.png"
        label="Switch User"
        accelIndex={0}
        onClick={() => onAction('Switch User')}
      />
      <ActionButton
        icon="/images/index-page/start-menu/logout.png"
        label="Log Off"
        accelIndex={0}
        onClick={() => onAction('Log Off')}
      />
    </DialogShell>
  );
}

// Shared XP dialog chrome: blue title bar with the Windows logo, the light-blue
// strip that holds the action buttons, and the Cancel footer.
function DialogShell({
  title,
  onClose,
  gap = 'gap-6',
  children,
}: {
  title: string;
  onClose: () => void;
  // Tailwind gap class for the action strip; two buttons sit wider apart than
  // three, so callers can override the default.
  gap?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ width: DIALOG_WIDTH, height: DIALOG_HEIGHT }}>
      <div className="flex h-12 items-center justify-between bg-blue-800">
        <p className="ml-1 text-xl text-white">{title}</p>
        <Image
          className="size-10"
          alt="Windows logo"
          src={'/images/index-page/shutdown-menu/windows-logo.png'}
          width={32}
          height={32}
        />
      </div>
      <div
        className={`flex h-32 w-full items-center justify-center bg-blue-400 ${gap}`}
      >
        {children}
      </div>
      <div className="relative h-12 bg-blue-800">
        <button
          onClick={onClose}
          className="absolute right-0.5 bottom-2.5 min-w-18.75 cursor-pointer rounded-[3px] border border-[#003c74] bg-[linear-gradient(to_bottom,#fdfdfd_0%,#f0f0ea_45%,#e3e3db_50%,#eeeef2_100%)] px-4 py-0.5 text-xs text-black shadow-[inset_0_0_0_1px_#fff] hover:border-[#0078d7] focus:outline-1 focus:outline-offset-[-3px] focus:outline-dotted active:bg-[linear-gradient(to_bottom,#e3e3db_0%,#eeeef2_100%)] disabled:cursor-default disabled:text-[#a0a0a0]"
        >
          <AcceleratorLabel label="Cancel" accelIndex={0} />
        </button>
      </div>
    </div>
  );
}

// One icon-over-label action in the blue strip. Disabled actions (e.g. Stand By)
// render dimmed and inert, like the greyed-out options in Windows XP.
function ActionButton({
  icon,
  label,
  accelIndex,
  onClick,
  disabled = false,
}: {
  icon: string;
  label: string;
  // Index of the letter to underline as the keyboard accelerator.
  accelIndex: number;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center enabled:cursor-pointer enabled:hover:brightness-110 disabled:opacity-30"
    >
      <Image alt={`${label} icon`} src={icon} width={32} height={32} />
      <p className={`text-sm ${disabled ? 'text-gray-500' : ''}`}>
        <AcceleratorLabel label={label} accelIndex={accelIndex} />
      </p>
    </button>
  );
}

// Renders `label` with the letter at `accelIndex` underlined, matching the
// keyboard-accelerator hints XP shows on its buttons.
function AcceleratorLabel({
  label,
  accelIndex,
}: {
  label: string;
  accelIndex: number;
}) {
  return (
    <>
      {label.slice(0, accelIndex)}
      <span className="underline">{label[accelIndex]}</span>
      {label.slice(accelIndex + 1)}
    </>
  );
}
