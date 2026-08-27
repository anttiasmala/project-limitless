import { useEffect, useRef, useState } from 'react';
import { CmdWindowModal } from '../../indexTypes';
import WindowFrame from '../window/WindowFrame';

type Props = {
  modal: CmdWindowModal;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
  onResize: (uuid: string, width: number, height: number) => void;
  onMinimize: (uuid: string) => void;
  onMaximize: (uuid: string) => void;
};

// Every command the prompt knows, with the command `help` or `commands` prints them
const COMMANDS = [
  { name: 'help', help: 'Shows all possible commands' },
  { name: 'commands', help: 'Shows all possible commands' },
  { name: 'clear', help: 'Clears the command prompt' },
] as const;

type CommandName = (typeof COMMANDS)[number]['name'];

const isCommand = (value: string): value is CommandName =>
  COMMANDS.some((command) => command.name === value);

// What the prompt prints in front of the line the user types.
const PROMPT = '>';

// One finished command: the line the user typed and what it printed. The
// output is worked out when Enter is pressed rather than while rendering, so
// the history stays a plain log and each command is interpreted exactly once.
type HistoryEntry = {
  input: string;
  output: string[];
  isError: boolean;
};

const runCommand = (input: string): HistoryEntry => {
  const command = input.trim().toLowerCase();

  // Enter on an empty line just moves on, like a real prompt.
  if (command === '') return { input, output: [], isError: false };

  if (!isCommand(command)) {
    return {
      input,
      output: [
        `'${input}' is not a valid command! Type 'help' to see commands!`,
      ],
      isError: true,
    };
  }

  if (command === 'help' || command === 'commands') {
    return {
      input,
      output: COMMANDS.map(({ name, help }) => `${name} - ${help}`),
      isError: false,
    };
  }

  // 'clear' is handled by the caller, which empties the history instead.
  return { input, output: [], isError: false };
};

export default function CommandPrompt({
  modal,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
}: Props) {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Type straight away when the window opens or is brought to the front,
  // instead of having to find and click the input first.
  useEffect(() => {
    if (modal.isFocused) inputRef.current?.focus();
  }, [modal.isFocused]);

  // Keep the newest line in view as output pushes the prompt down.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const submit = () => {
    if (inputText.trim().toLowerCase() === 'clear') {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, runCommand(inputText)]);
    }
    setInputText('');
  };

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
      <div
        ref={scrollRef}
        // Clicking anywhere in the window puts the caret back in the input,
        // like clicking into a real console window.
        onMouseDown={() => inputRef.current?.focus()}
        className="min-h-0 flex-1 overflow-y-auto bg-black p-1 font-mono text-sm text-[#c0c0c0]"
      >
        <p>Microsoft Windows XP [Version 5.1.2600]</p>
        <p>(C) Copyright 1985-2001 Microsoft Corp.</p>

        {/* The log of commands already run, oldest first. Entries are only
            ever appended (or cleared as a whole), so the index is a stable key. */}
        {history.map((entry, index) => (
          <div key={index} className={entry.output.length ? 'mb-2' : ''}>
            <p>
              {PROMPT}
              {entry.input}
            </p>
            {entry.output.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className={entry.isError ? 'text-red-400' : 'font-bold'}
              >
                {line}
              </p>
            ))}
          </div>
        ))}

        <form
          className="flex flex-row items-center"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <span>{PROMPT}</span>
          <input
            ref={inputRef}
            aria-label="Command prompt input"
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-1 text-[#c0c0c0] outline-0"
            value={inputText}
            onChange={(e) => setInputText(e.currentTarget.value)}
          />
        </form>
      </div>
    </WindowFrame>
  );
}
