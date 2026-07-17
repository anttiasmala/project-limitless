import Image from 'next/image';
import { useRef } from 'react';
import { useWindowDrag } from '../../../../hooks/index-page/useWindowDrag';
import {
  ResizeDirection,
  useWindowResize,
} from '../../../../hooks/index-page/useWindowResize';
import { WindowModal as WindowModalType } from '../../indexTypes';

type Props = {
  modal: WindowModalType;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
  // Each optional handler below.
  // the window has resize edges only when `onResize` is passed, and a
  // title bar button appears only when it has a handler. An error dialog
  // passes none of the three and so comes out fixed-size with nothing but a
  // close button, like a real XP message box.
  onResize?: (uuid: string, width: number, height: number) => void;
  onMinimize?: (uuid: string) => void;
  onMaximize?: (uuid: string) => void;
  children: React.ReactNode;
};

// Smallest a window may be dragged down to while resizing.
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

// Small grab handlers along each edge and corner. The corners sit above the edges (z-index)
// so their diagonal cursor wins where the two overlap.
const RESIZE_HANDLES: { dir: ResizeDirection; className: string }[] = [
  { dir: 'nw', className: 'top-0 left-0 z-1 h-1 w-1 cursor-nw-resize' },
  { dir: 'n', className: 'top-0 left-0 h-1 w-full cursor-n-resize' },
  { dir: 'ne', className: 'top-0 right-0 z-1 h-1 w-1 cursor-ne-resize' },
  { dir: 'e', className: 'top-0 right-0 h-full w-1 cursor-e-resize' },
  { dir: 'se', className: 'right-0 bottom-0 z-1 h-1 w-1 cursor-se-resize' },
  { dir: 's', className: 'right-0 bottom-0 h-1 w-full cursor-s-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 z-1 h-1 w-1 cursor-sw-resize' },
  { dir: 'w', className: 'bottom-0 left-0 h-full w-1 cursor-w-resize' },
];

// Everything below the title bar is `children`, so each window type
// only has to describe its own contents.
export default function WindowFrame({
  modal,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  const startDrag = useWindowDrag(rootRef, {
    disabled: modal.isMaximized,
    onMoveEnd: (top, left) => onMove(modal.uuid, top, left),
  });

  const startResize = useWindowResize(rootRef, {
    disabled: modal.isMaximized,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    onResizeEnd: (width, height, top, left) => {
      onResize?.(modal.uuid, width, height);
      onMove(modal.uuid, top, left);
    },
  });

  if (!modal.isOpen) return null;

  return (
    <div
      ref={rootRef}
      onMouseDown={() => onFocus(modal.uuid)}
      style={{
        zIndex: modal.zIndex,
        top: modal.top,
        left: modal.left,
        width: modal.width,
        height: modal.height,
      }}
      className="absolute flex flex-col overflow-hidden rounded-t-lg border border-[#0831d9] bg-white shadow-2xl"
    >
      {onResize &&
        RESIZE_HANDLES.map((handle) => (
          <div
            key={handle.dir}
            className={`absolute ${handle.className}`}
            onMouseDown={startResize(handle.dir)}
          />
        ))}

      {/* XP Luna title bar */}
      <div
        onMouseDown={(e) => {
          if (!(e.target instanceof Element)) return;

          // Ignore dragging if <button> is clicked
          if (e.target.closest('button')) return;
          startDrag(e);
        }}
        onDoubleClick={() => onMaximize?.(modal.uuid)}
        className={`flex h-7.5 items-center rounded-t-[7px] border-b pr-1 pl-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${modal.isFocused ? 'xp-titlebar-active border-b-[#0831d9]' : 'xp-titlebar-inactive border-b-[#7196dd]'} ${
          modal.isMaximized ? 'cursor-default' : 'cursor-move'
        }`}
      >
        {modal.modalIcon && (
          <Image
            alt=""
            src={modal.modalIcon}
            width={16}
            height={16}
            className="shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
          />
        )}
        <p
          className={`mt-1 ml-1.5 truncate text-sm font-bold select-none [text-shadow:1px_1px_1px_rgba(0,0,0,0.6)] ${modal.isFocused ? 'text-white' : 'text-[#d9e4f5]'}`}
        >
          {modal.modalName}
        </p>

        {/* Window controls */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Minimize */}
          {onMinimize && (
            <button
              type="button"
              aria-label="Minimize"
              className={`relative flex h-5.25 w-5.25 cursor-pointer items-center justify-center rounded-[3px] border shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90 ${modal.isFocused ? 'xp-btn-active border-white/80' : 'xp-btn-inactive border-white/50'}`}
              onClick={() => onMinimize(modal.uuid)}
            >
              <span className="mt-2 h-0.75 w-2.25 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
            </button>
          )}

          {/* Maximize / Restore */}
          {onMaximize && (
            <button
              type="button"
              aria-label={modal.isMaximized ? 'Restore' : 'Maximize'}
              className={`flex h-5.25 w-5.25 cursor-pointer items-center justify-center rounded-[3px] border shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90 ${modal.isFocused ? 'xp-btn-active border-white/80' : 'xp-btn-inactive border-white/50'}`}
              onClick={() => onMaximize(modal.uuid)}
            >
              <span className="h-2.5 w-2.75 rounded-[1px] border-2 border-t-[3px] border-white bg-transparent shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => onClose(modal.uuid)}
            className={`relative flex h-5.25 w-5.25 cursor-pointer items-center justify-center rounded-[3px] border shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90 ${modal.isFocused ? 'xp-close-active border-white/80' : 'xp-close-inactive border-white/50'}`}
          >
            <span className="absolute h-0.5 w-3 rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
            <span className="absolute h-0.5 w-3 -rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
