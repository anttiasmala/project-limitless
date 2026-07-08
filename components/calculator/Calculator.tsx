'use client';

import {
  ButtonHTMLAttributes,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import {
  calculatorKeyPressHandler,
  displayToRawIndex,
  rawToDisplayIndex,
} from './calculatorUtils';
import { toast } from 'react-toastify';

const OPERATORS = ['+', '-', '×', '/'];

/** Separates numbers from operators like ["2", "+", "2"] */
function tokenize(string: string) {
  // Brackets '(' and ')' are in the character class too, otherwise match()
  // would silently drop them (they'd match nothing and vanish from the tokens).
  return string.match(/\d+\.?\d*|[+\-×/()]/g) ?? [];
}

// Recursive-descent parser. It walks the token list once, using a `pos` cursor,
// and calls each other by precedence (lowest first). This single pass replaces
// the old flat evaluate() + normalizeSigns(), and it naturally supports
// brackets, operator precedence, and unary +/- signs.

// On anything malformed (missing bracket, stray operator, ...) it throws, and
// the caller turns that into the "Malformed expression" toast.
function evaluate(tokens: string[]): number {
  // Where we are in the token list. Every parse function advances it.
  let pos = 0;

  // The token we are about to look at (undefined once we run off the end).
  const peek = () => tokens[pos];

  // Handles the LOWEST-priority operators: + and -.
  // It reads a value, then keeps adding/subtracting more values after it,
  // left to right. e.g. "1 + 2 - 3" -> (1 + 2) then - 3.
  // Each "value" here is a parseTerm(), so any × or / inside is already
  // worked out first — that's how precedence ("× before +") happens.
  function parseExpr(): number {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const operator = tokens[pos++]; // consume the operator

      const rightHandSide = parseTerm();
      value = operator === '+' ? value + rightHandSide : value - rightHandSide;
    }
    return value;
  }

  // Handles the HIGHER-priority operators: × and /.
  // Same shape as parseExpr, but for multiply/divide. Because parseExpr calls
  // this for each of its values, a "2 × 3" gets fully calculated before the
  // surrounding + or - ever sees it. e.g. "2 + 3 × 4" -> 3 × 4 = 12 first.
  // and 2 + 12. Just like order of calculations works
  function parseTerm(): number {
    let value = parseFactor();
    while (peek() === '×' || peek() === '/') {
      const operator = tokens[pos++]; // consume the operator

      const rightHandSide = parseFactor();
      value = operator === '×' ? value * rightHandSide : value / rightHandSide;
    }
    return value;
  }

  // Handles the smallest building blocks — the actual "values". A factor is one
  // of three things:
  //   1. a sign in front of a value:  -2  or  +2  (see below)
  //   2. a bracket group:  (1 + 2)  -> calculate the inside, use its result
  //   3. a plain number:   42
  // Brackets get their answer here, which is why "(1 + 2) × 3" works: the group
  // is turned into a single value (3) before parseTerm multiplies it.
  function parseFactor(): number {
    const token = peek();

    // Unary '+' / '-': the sign belongs to whatever follows. Recurse back into
    // factor so things like "--2" (double negative) or "-(1+2)" also work.
    if (token === '+' || token === '-') {
      pos++; // consume the sign
      const value = parseFactor();
      return token === '-' ? -value : value;
    }

    // '(' ... ')': parse the inside as a full expression, then demand the ')'.
    if (token === '(') {
      pos++; // consume '('
      const value = parseExpr();
      if (peek() !== ')') throw new Error('Missing closing bracket');
      pos++; // consume ')'
      return value;
    }

    // Otherwise it has to be a number.
    const number = Number(token);
    if (token === undefined || Number.isNaN(number)) {
      throw new Error('Expected a number');
    }
    pos++; // consume the number
    return number;
  }

  const result = parseExpr();
  // If tokens are left over (e.g. an unmatched ')'), the input was malformed.
  if (pos !== tokens.length) throw new Error('Unexpected trailing tokens');
  return result;
}

/** This adds thousand separator that is shown for user */
function formatForDisplay(raw: string): string {
  return raw.replace(/\d+(\.\d*)?/g, (match) => {
    const [intPart, decPart] = match.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
  });
}

export default function Calculator() {
  const [currentDraft, setCurrentDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Where we want the caret AFTER the next render, measured in the raw
  // (unformatted) string. null means "leave the caret where the browser put it".
  const rawCaretRef = useRef<number | null>(null);

  // After every render React shows the freshly formatted value and the browser
  // drops the caret at the end. We run AFTER that (useLayoutEffect, before the
  // browser paints) to put the caret back. We translate our raw caret position
  // into a display position so the thousand separators don't throw it off.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || rawCaretRef.current === null) return;
    const displayCaret = rawToDisplayIndex(input.value, rawCaretRef.current);
    // preventScroll: on small screens the input can be off-screen when a bottom
    // button is tapped; a plain focus() scrolls it into view and makes the page jump
    input.focus({ preventScroll: true });
    input.setSelectionRange(displayCaret, displayCaret);
    rawCaretRef.current = null;
  });

  const addNumber = useCallback(function addNumber(stringNumber: string) {
    // Read the caret from the input NOW (before the state update). This index
    // is into the DISPLAYED text, so it includes the thousand separators.
    const displayCaret = inputRef.current?.selectionStart ?? 0;

    setCurrentDraft((prevValue) => {
      // if value is null, it means there is not any value, 0 is a placeholder
      // if (.) is clicked, add (0.). Otherwise whatever was clicked
      if (prevValue === null) {
        const next = stringNumber === '.' ? '0.' : stringNumber;
        rawCaretRef.current = next.length; // caret to the end of what we added
        return next;
      }

      // The fix: turn the display caret (commas counted) into a position inside
      // the raw string (commas ignored) so we insert at the right spot.
      const rawCaret = displayToRawIndex(
        formatForDisplay(prevValue),
        displayCaret,
      );

      // The character immediately left of the caret drives the dot rules below.
      const charBefore = prevValue[rawCaret - 1];

      let toInsert = stringNumber;
      if (stringNumber === '.') {
        // don't allow two dots in a row, prevents (0..2) when (0.2) is meant
        if (charBefore === '.') return prevValue;
        // a dot right after an operator (or at the very start) becomes "0." so
        // we get e.g. "2+0." instead of "2+." For example 2+ -> 2+0. not 2+.
        if (charBefore === undefined || OPERATORS.includes(charBefore)) {
          toInsert = '0.';
        }
      }

      const newValue =
        prevValue.slice(0, rawCaret) + toInsert + prevValue.slice(rawCaret);
      // Caret should sit right after the characters we just inserted (still in
      // raw coordinates, the layout effect maps it back to a display position).
      rawCaretRef.current = rawCaret + toInsert.length;

      return newValue;
    });
  }, []);

  /** Removes a number / operator **left**-side of caret */
  const removeNumber = useCallback(function removeNumber() {
    // Same idea as addNumber: read the caret (display coordinates) up front.
    const caretStart = inputRef.current?.selectionStart ?? 0;
    const caretEnd = inputRef.current?.selectionEnd ?? 0;

    setCurrentDraft((prevValue) => {
      if (prevValue === null) return null;

      // Map to the raw string so we delete the character the user actually sees
      // to the left of the caret, not just the last one.
      const rawCaretStart = displayToRawIndex(
        formatForDisplay(prevValue),
        caretStart,
      );

      const rawCaretEnd = displayToRawIndex(
        formatForDisplay(prevValue),
        caretEnd,
      );

      // A selection (the user "painted" some digits): delete exactly the
      // selected range — keep what's before the start and after the end.
      if (caretStart !== caretEnd) {
        const newValue =
          prevValue.slice(0, rawCaretStart) + prevValue.slice(rawCaretEnd);
        // Caret stays where the selection started.
        rawCaretRef.current = rawCaretStart;
        return newValue === '' ? null : newValue;
      }

      // Caret at the very start: nothing to the left to delete.
      if (rawCaretStart === 0) return prevValue;

      const newValue =
        prevValue.slice(0, rawCaretStart - 1) + prevValue.slice(rawCaretStart);
      // Caret shifts one left, onto the spot the removed character used to hold.
      rawCaretRef.current = rawCaretStart - 1;
      // Empty string -> back to null so the "0" placeholder shows again.

      return newValue === '' ? null : newValue;
    });
  }, []);

  /** Removes a number / operator **right**-side of caret */
  const removeAheadNumber = useCallback(function removeAheadNumber() {
    const caretStart = inputRef.current?.selectionStart ?? 0;
    const caretEnd = inputRef.current?.selectionEnd ?? 0;

    setCurrentDraft((prevValue) => {
      if (prevValue === null) return null;

      // Map the display caret(s) to the raw string, same as removeNumber.
      const rawCaretStart = displayToRawIndex(
        formatForDisplay(prevValue),
        caretStart,
      );

      const rawCaretEnd = displayToRawIndex(
        formatForDisplay(prevValue),
        caretEnd,
      );

      // A selection (the user "painted" some digits): delete exactly the
      // selected range — keep what's before the start and after the end.
      if (caretStart !== caretEnd) {
        const newValue =
          prevValue.slice(0, rawCaretStart) + prevValue.slice(rawCaretEnd);
        // Caret stays where the selection started.
        rawCaretRef.current = rawCaretStart;
        return newValue === '' ? null : newValue;
      }

      // Caret at the very end: nothing to the right to delete.
      if (rawCaretStart === prevValue.length) return prevValue;

      // Drop the character the caret sits in front of (the one to its right).
      const newValue =
        prevValue.slice(0, rawCaretStart) + prevValue.slice(rawCaretStart + 1);
      // The caret doesn't move: everything left of it is untouched.
      rawCaretRef.current = rawCaretStart;
      // Empty string -> back to null so the "0" placeholder shows again.
      return newValue === '' ? null : newValue;
    });
  }, []);

  const calculateAnswer = useCallback(function calculateAnswer() {
    setCurrentDraft((prev) => {
      if (prev === null) return prev;
      // evaluate() throws on malformed input (bad brackets, stray operators,
      // ...); treat that the same as a non-finite result below.
      let answer: number;
      try {
        answer = evaluate(tokenize(prev));
      } catch {
        answer = NaN;
      }
      if (!Number.isFinite(answer)) {
        toast('Malformed expression'); // toast the error to frontend
        return prev; // keep the user given expression so the user can fix it
      }
      const result = answer.toString();
      // After "=", move the caret to the very end of the answer (end of line),
      // like a normal calculator, instead of leaving it mid-number.
      rawCaretRef.current = result.length;
      // When the value is just a number (no operators), "result" (achieved by clicking "=" button) equals
      // "prev", so React skips the re-render and the caret layout effect never
      // runs. Focus + place the caret here so "=" always lands it at the end.
      // Use the *display* length so thousand separators don't shift it.
      const input = inputRef.current;
      if (input) {
        input.focus({ preventScroll: true }); // see the comments in other input.focus()
        const end = formatForDisplay(result).length;
        input.setSelectionRange(end, end);
      }
      return result;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      calculatorKeyPressHandler({
        e,
        key: e.key,
        addNumber: (number) => addNumber(number),
        removeNumber,
        removeAheadNumber,
        setCurrentDraft,
        calculateAnswer,
      });
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addNumber, removeNumber, removeAheadNumber, calculateAnswer]);

  return (
    <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900/70">
      <input
        ref={inputRef}
        id="input"
        inputMode="none"
        placeholder="1+1=2...."
        onChange={() => {}}
        // Controlled input: the value always comes from currentDraft, so the
        // browser's own edits are reverted on the next render. We deliberately
        // do NOT use readOnly here: read-only inputs hide the blinking caret
        // in some browsers, and we want the caret visible so the user can
        // place it. The caret is read on demand in addNumber/removeNumber
        className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-end text-3xl tabular-nums caret-cyan-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
        value={currentDraft === null ? '' : formatForDisplay(currentDraft)}
      />
      <div className="grid grid-cols-4 gap-2">
        {/* Top utility row */}
        <Button variant="danger" onClick={() => setCurrentDraft(null)}>
          CE
        </Button>
        <Button variant="danger" onClick={removeNumber}>
          {'<-'}
        </Button>
        <Button variant="operator" onClick={() => addNumber('(')}>
          (
        </Button>
        <Button variant="operator" onClick={() => addNumber(')')}>
          )
        </Button>

        {/* Row 1 */}
        <Button onClick={() => addNumber('7')}>7</Button>
        <Button onClick={() => addNumber('8')}>8</Button>
        <Button onClick={() => addNumber('9')}>9</Button>
        <Button variant="operator" onClick={() => addNumber('/')}>
          /
        </Button>

        {/* Row 2 */}
        <Button onClick={() => addNumber('4')}>4</Button>
        <Button onClick={() => addNumber('5')}>5</Button>
        <Button onClick={() => addNumber('6')}>6</Button>
        <Button variant="operator" onClick={() => addNumber('×')}>
          ×
        </Button>

        {/* Row 3 */}
        <Button onClick={() => addNumber('1')}>1</Button>
        <Button onClick={() => addNumber('2')}>2</Button>
        <Button onClick={() => addNumber('3')}>3</Button>
        <Button variant="operator" onClick={() => addNumber('-')}>
          -
        </Button>

        {/* Row 4 */}
        <Button onClick={() => addNumber('0')}>0</Button>
        <Button onClick={() => addNumber('.')}>.</Button>
        <Button variant="equals" onClick={calculateAnswer}>
          =
        </Button>
        <Button variant="operator" onClick={() => addNumber('+')}>
          +
        </Button>
      </div>
    </div>
  );
}

type ButtonVariant = 'digit' | 'operator' | 'equals' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Digits: neutral, dark-mode aware
  digit:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  // Operators: cyan accent (matches the display focus/caret + app ocean theme)
  operator:
    'bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500',
  // The "go" action stands apart in green
  equals:
    'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  // CE / backspace: muted destructive tone
  danger:
    'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/70',
};

function Button({
  children,
  className,
  variant = 'digit',
  onPointerDown,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  // Adds a ripple that grows from the touch/click point from center to
  // the button's edges. This is far easier to notice on a phone than the small
  // active:scale feedback alone. The Web Animations API is used + currentColor so
  // there are no global CSS keyframes to maintain. The ripple automatically
  // tints itself to match each variant's text color (visible on every button).
  function spawnRipple(e: ReactPointerEvent<HTMLButtonElement>) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    // Diameter big enough to cover the whole button from wherever it starts.
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `position:absolute;border-radius:9999px;pointer-events:none;background:currentColor;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
    button.appendChild(ripple);

    const animation = ripple.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration: 500, easing: 'ease-out' },
    );
    animation.onfinish = () => ripple.remove();
  }

  return (
    <button
      onPointerDown={(e) => {
        spawnRipple(e);
        onPointerDown?.(e);
      }}
      className={twMerge(
        'relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl text-2xl font-medium shadow-sm transition-colors duration-150 active:scale-95',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
