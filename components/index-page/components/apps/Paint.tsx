import { useState } from 'react';
import { PaintWindowModal } from '../../indexTypes';
import WindowFrame from '../window/WindowFrame';
import Link from 'next/link';

/*
All credits belongs to: jspaint.app
The project: https://github.com/1j01/jspaint

License from Github: JS Paint is free and open source software, licensed under the permissive MIT license.
https://github.com/1j01/jspaint#license
*/

type Props = {
  modal: PaintWindowModal;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
  onResize: (uuid: string, width: number, height: number) => void;
  onMinimize: (uuid: string) => void;
  onMaximize: (uuid: string) => void;
};

export default function Paint({
  modal,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <WindowFrame
      modal={modal}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
      onResize={onResize}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onHelp={() => setShowHelp((prev) => !prev)}
    >
      {showHelp && (
        // A plain div (not a button) because it contains links. Clicking the note dismisses it,
        // while the links stop propagation so they open without closing the help modal.
        <div
          onClick={() => setShowHelp(false)}
          className="absolute top-7 right-2 z-1 max-w-56 cursor-default border border-[#8b8878] bg-[#ffffe1] px-2 py-1 text-left text-[11px] leading-relaxed text-black shadow-md"
        >
          All credit belongs to{' '}
          <Link
            onClick={(e) => e.stopPropagation()}
            href="https://jspaint.app"
            target="_blank"
            className="text-blue-500 underline"
          >
            https://jspaint.app
          </Link>
          <br />
          The Github page:{' '}
          <Link
            onClick={(e) => e.stopPropagation()}
            href="https://github.com/1j01/jspaint"
            target="_blank"
            className="text-blue-500 underline"
          >
            https://github.com/1j01/jspaint
          </Link>
        </div>
      )}

      <iframe
        title="Paint"
        src="https://jspaint.app"
        className="min-h-0 w-full flex-1 border-0"
      />
    </WindowFrame>
  );
}
