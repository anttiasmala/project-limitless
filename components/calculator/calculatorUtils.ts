import { Dispatch, SetStateAction } from 'react';

/**
 * The input shows a formatted string (with thousand separators, e.g. "1,234")
 * while we store the raw string ("1234"). A caret index therefore means two
 * different things depending on which string it points into. These two helpers
 * translate a caret between the two index spaces by counting the commas.
 */

/** Display index (commas counted) -> raw index (commas ignored). */
export function displayToRawIndex(
  display: string,
  displayIndex: number,
): number {
  let raw = 0;
  for (let i = 0; i < displayIndex; i++) {
    if (display[i] !== ',') raw++;
  }
  return raw;
}

/** Raw index (commas ignored) -> display index (commas counted). */
export function rawToDisplayIndex(display: string, rawIndex: number): number {
  if (rawIndex <= 0) return 0;
  let raw = 0;
  for (let i = 0; i < display.length; i++) {
    if (display[i] !== ',') raw++;
    // Once we've passed `rawIndex` real characters, the caret sits just after
    // this character. If the next char is a comma we stay before it, so the
    // caret never lands "inside" a group separator.
    if (raw === rawIndex) return i + 1;
  }
  return display.length;
}

type Props = {
  e: KeyboardEvent;
  key: string;
  addNumber: (number: string) => void;
  removeNumber: () => void;
  removeAheadNumber: () => void;
  setCurrentDraft: Dispatch<SetStateAction<string | null>>;
  calculateAnswer: () => void;
};

export function calculatorKeyPressHandler({
  e,
  key,
  addNumber,
  removeNumber,
  removeAheadNumber,
  setCurrentDraft,
  calculateAnswer,
}: Props) {
  // Let modifier combos (Ctrl/Meta/Alt) through — they're shortcuts like
  // Ctrl+3 for tab switching, not calculator input. Shift key is NOT intentionally
  // included, since Shift is be used on '/' and '*' (Finnish keyboard layout)
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  // Pick the action for this key, but don't run it yet. Keys we don't handle
  // (arrows, Home/End, copy/paste, …) leave `handler` undefined so the browser
  // keeps its default behaviour.
  let handler: (() => void) | undefined;

  if ('0123456789.+-/'.includes(key)) {
    handler = () => addNumber(key);
  } else if (key === '*') {
    handler = () => addNumber('×');
  } else if (key === 'Backspace') {
    handler = removeNumber;
  } else if (key === 'Delete') {
    handler = removeAheadNumber;
  } else if (key === 'Escape') {
    handler = () => setCurrentDraft(null);
  } else if (key === 'Enter' || key === '=') {
    handler = calculateAnswer;
  }

  if (!handler) return;

  // One place to swallow the default — and only for keys we actually act on.
  e.preventDefault();
  handler();
}
