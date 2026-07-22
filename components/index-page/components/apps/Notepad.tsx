import { useEffect, useRef, useState } from 'react';
import { NotepadWindowModal } from '../../indexTypes';
import WindowFrame from '../window/WindowFrame';

// Typing edits landing within this many ms collapse into a single undo step, so
// Undo reverts a burst/word at a time instead of one character.
const COALESCE_MS = 500;

type Props = {
  modal: NotepadWindowModal;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
  onResize: (uuid: string, width: number, height: number) => void;
  onMinimize: (uuid: string) => void;
  onMaximize: (uuid: string) => void;
};

// The wired-up menu commands. An entry with one of these is clickable. An entry
// without is a greyed-out placeholder (shown, but not clickable) like real XP menus
// whose commands aren't implemented here.
type Action =
  | 'new'
  | 'exit'
  | 'undo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'delete'
  | 'selectAll'
  | 'wordWrap'
  | 'timeAndDate';

// A single dropdown entry: a separator line, or a row. `checked` draws a ✓ to
// the left, like Format → Word Wrap when it's on.
type MenuEntry =
  | { type: 'separator' }
  | { type: 'item'; label: string; checked?: boolean; action?: Action };

export default function Notepad({
  modal,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
}: Props) {
  const [text, setText] = useState('');
  // Real Notepad opens with Word Wrap off, so long lines scroll horizontally.
  const [wordWrap, setWordWrap] = useState(false);
  // The name of the open top-level menu, or null when the bar is idle.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // The editor is controlled, so the browser's native undo doesn't apply. We
  // keep our own history of full-text "snapshots" instead.
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // The textarea selection captured just before a menu steals focus, so a menu
  // command can act on exactly what was highlighted.
  const selRef = useRef({ start: 0, end: 0 });
  // Timestamp of the last typing edit, so a rapid burst coalesces into one undo.
  const lastEditRef = useRef(0);

  const rememberSelection = () => {
    const el = textRef.current;
    if (el) selRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  // Close the open menu on an outside click or Escape, like a real menu bar.
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  // Drop the caret at `caret`, mirror it into selRef, and re-focus the editor.
  const placeCaret = (caret: number) => {
    selRef.current = { start: caret, end: caret };
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  // Record a pre-edit snapshot so it can be brought back, discarding any redo
  // history (a fresh edit overwrites the timeline).
  const pushUndo = (snapshot: string) => {
    setUndoStack((s) => [...s, snapshot]);
    setRedoStack((r) => (r.length ? [] : r));
  };

  // Typing: bursts within COALESCE_MS share one undo step, like a real editor.
  const handleType = (next: string) => {
    const now = Date.now();
    if (now - lastEditRef.current >= COALESCE_MS) pushUndo(text);
    lastEditRef.current = now;
    setText(next);
  };

  // A menu/programmatic edit (new/cut/delete/paste/insert): always its own undo
  // step, with the caret placed afterwards.
  const commitEdit = (next: string, caret: number) => {
    pushUndo(text);
    lastEditRef.current = 0;
    setText(next);
    placeCaret(caret);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((r) => [...r, text]);
    lastEditRef.current = 0;
    setText(prev);
    placeCaret(prev.length);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((s) => [...s, text]);
    lastEditRef.current = 0;
    setText(next);
    placeCaret(next.length);
  };

  // Cut / Copy / Paste use the async Clipboard API. It needs a secure context
  // (HTTPS or localhost) over plain HTTP, but the textarea's own
  // Ctrl+X/C/V keep working there regardless.
  const copySelection = async () => {
    const { start, end } = selRef.current;
    if (start === end || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(text.slice(start, end));
    } catch {
      // Clipboard write was blocked or denied - nothing to do.
    }
  };

  const cutSelection = async () => {
    const { start, end } = selRef.current;
    if (start === end) return;
    await copySelection();
    commitEdit(text.slice(0, start) + text.slice(end), start);
  };

  const deleteSelection = () => {
    const { start, end } = selRef.current;
    if (start === end) return;
    commitEdit(text.slice(0, start) + text.slice(end), start);
  };

  const paste = async () => {
    if (!navigator.clipboard?.readText) return;
    try {
      const clip = await navigator.clipboard.readText();
      const { start, end } = selRef.current;
      commitEdit(
        text.slice(0, start) + clip + text.slice(end),
        start + clip.length,
      );
    } catch {
      // Clipboard read was blocked or denied, leave the text untouched.
    }
  };

  // Insert the current time and date at the caret, like Notepad's F5 / Time-Date.
  const insertTimeAndDate = () => {
    rememberSelection();
    const now = new Date();
    const stamp = `${now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })} ${now.toLocaleDateString()}`;
    const { start, end } = selRef.current;
    commitEdit(
      text.slice(0, start) + stamp + text.slice(end),
      start + stamp.length,
    );
  };

  const runAction = (action: Action) => {
    switch (action) {
      case 'new':
        commitEdit('', 0);
        break;
      case 'exit':
        onClose(modal.uuid);
        break;
      case 'undo':
        undo();
        break;
      case 'cut':
        void cutSelection();
        break;
      case 'copy':
        void copySelection();
        break;
      case 'paste':
        void paste();
        break;
      case 'delete':
        deleteSelection();
        break;
      case 'selectAll':
        textRef.current?.focus();
        textRef.current?.select();
        break;
      case 'wordWrap':
        setWordWrap((prev) => !prev);
        break;
      case 'timeAndDate':
        insertTimeAndDate();
        break;
    }
  };

  // Undo/redo have no working native path on a controlled textarea, so drive
  // them from the keyboard here. F5 inserts the time/date, like real Notepad.
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    } else if (e.key === 'F5') {
      e.preventDefault();
      insertTimeAndDate();
    }
  };

  const menus: { name: string; entries: MenuEntry[] }[] = [
    {
      name: 'File',
      entries: [
        { type: 'item', label: 'New', action: 'new' },
        { type: 'item', label: 'Open...' },
        { type: 'item', label: 'Save' },
        { type: 'item', label: 'Save As...' },
        { type: 'separator' },
        { type: 'item', label: 'Page Setup...' },
        { type: 'item', label: 'Print...' },
        { type: 'separator' },
        { type: 'item', label: 'Exit', action: 'exit' },
      ],
    },
    {
      name: 'Edit',
      entries: [
        // Greyed out when there's nothing to undo, like real Notepad.
        {
          type: 'item',
          label: 'Undo',
          action: undoStack.length ? 'undo' : undefined,
        },
        { type: 'separator' },
        { type: 'item', label: 'Cut', action: 'cut' },
        { type: 'item', label: 'Copy', action: 'copy' },
        { type: 'item', label: 'Paste', action: 'paste' },
        { type: 'item', label: 'Delete', action: 'delete' },
        { type: 'separator' },
        { type: 'item', label: 'Find...' },
        { type: 'item', label: 'Find Next' },
        { type: 'item', label: 'Replace...' },
        { type: 'item', label: 'Go To...' },
        { type: 'separator' },
        { type: 'item', label: 'Select All', action: 'selectAll' },
        { type: 'item', label: 'Time/Date', action: 'timeAndDate' },
      ],
    },
    {
      name: 'Format',
      entries: [
        {
          type: 'item',
          label: 'Word Wrap',
          checked: wordWrap,
          action: 'wordWrap',
        },
        { type: 'item', label: 'Font...' },
      ],
    },
    {
      name: 'View',
      entries: [{ type: 'item', label: 'Status Bar' }],
    },
    {
      name: 'Help',
      entries: [
        { type: 'item', label: 'Help Topics' },
        { type: 'separator' },
        { type: 'item', label: 'About Notepad' },
      ],
    },
  ];

  return (
    <WindowFrame
      modal={modal}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
      onResize={onResize}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-[#ece9d8] text-black">
        {/* Menu bar */}
        <div
          ref={barRef}
          className="flex shrink-0 flex-row text-xs select-none"
        >
          {menus.map((menu) => {
            const isOpen = openMenu === menu.name;
            return (
              <div key={menu.name} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(isOpen ? null : menu.name)}
                  onMouseEnter={() =>
                    setOpenMenu((prev) => (prev ? menu.name : prev))
                  }
                  className={`cursor-default px-2 py-1 ${
                    isOpen
                      ? 'bg-[#316ac5] text-white'
                      : 'hover:bg-[#316ac5] hover:text-white'
                  }`}
                >
                  {menu.name}
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 z-50 min-w-44 border border-[#aca899] bg-[#f0efe7] py-0.5 shadow-[2px_2px_3px_rgba(0,0,0,0.35)]">
                    {menu.entries.map((entry, i) =>
                      entry.type === 'separator' ? (
                        <div key={i} className="my-0.5 h-px bg-[#aca899]" />
                      ) : entry.action ? (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            runAction(entry.action!);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center px-2 py-0.5 text-left hover:bg-[#316ac5] hover:text-white"
                        >
                          <span className="w-4 shrink-0">
                            {entry.checked ? '✓' : ''}
                          </span>
                          <span>{entry.label}</span>
                        </button>
                      ) : (
                        // Disabled placeholder: greyed out, no action, no hover.
                        <div
                          key={i}
                          className="flex cursor-default items-center px-2 py-0.5 text-[#aca899]"
                        >
                          <span className="w-4 shrink-0" />
                          <span>{entry.label}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor */}
        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => handleType(e.target.value)}
          onKeyDown={handleEditorKeyDown}
          onSelect={rememberSelection}
          onBlur={rememberSelection}
          spellCheck={false}
          wrap={wordWrap ? 'soft' : 'off'}
          className={`min-h-0 flex-1 resize-none border border-[#7f9db9] bg-white p-0.5 font-mono text-sm leading-tight whitespace-pre text-black focus:outline-none ${
            wordWrap ? 'overflow-x-hidden' : 'overflow-auto'
          }`}
        />
      </div>
    </WindowFrame>
  );
}
