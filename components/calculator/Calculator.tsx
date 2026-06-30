'use client';

import {
  ButtonHTMLAttributes,
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
  return string.match(/\d+\.?\d*|[+\-×/]/g) ?? [];
}

// A leading '-'/'+' or one right after another operator is unary (part of the
// number), e.g. -2 or 2 - -3. Merge it into the following number so evaluate()
// keeps its number, operator, number, operator... structure.
// Important: Unary means the "-" or "+" sign is part of the number. For example -1 + 2, the "-" in 1 is a unary
function normalizeSigns(tokens: string[]) {
  // the list we build up and return, values are like (e.g. ["-2", "+", "2"])
  const result: string[] = [];

  // loop through every token from the raw tokenize() output
  for (let i = 0; i < tokens.length; i++) {
    // the token we are currently looking at
    const token = tokens[i];

    // the previous token we already pushed into result. Used to decide
    // whether the current sign is unary. undefined when result is empty.
    const prev = result[result.length - 1];

    // a '-' or '+' is unary (a sign on a number (positive ("+") / negative ("-")), not subtraction/addition)
    // when it is either:
    //   - at the very start of the expression (result.length === 0), or
    //   - directly after another operator (e.g. the second '-' in "2 - -3", looks in calculator: "2--3")
    const isUnary =
      (token === '-' || token === '+') &&
      (result.length === 0 || OPERATORS.includes(prev));

    // only merge if it's unary AND there is a number after it to attach to
    if (isUnary && i + 1 < tokens.length) {
      // glue the sign onto the next number: '-' makes it negative,
      // a unary '+' is a positive, so we just keep the number as it is, so no sign needed
      result.push(token === '-' ? '-' + tokens[i + 1] : tokens[i + 1]);
      // we just used tokens[i + 1], so skip it on the next loop by incrementing the "i"
      i++;
    } else {
      // not a unary sign — a normal number or binary operator, keep it
      result.push(token);
    }
  }

  // result now alternates number, operator, number... with signs folded in
  return result;
}

function evaluate(tokens: string[]) {
  let number = 0;
  const array1: (string | number)[] = [tokens[0]];
  let operator = '';
  // regex splits the tokens array like this
  // [1, "+", 2, "/"], etc. Every second value is an operator
  // that's why i += 2 instead of i++, with i++ the order would break
  for (let i = 1; i < tokens.length; i += 2) {
    // we can set operator to tokens[i], because we know how REGEX splits the values
    // indexes 1, 3, 5, 7, etc are operators
    operator = tokens[i];
    // indexes 0, 2, 4, 6, etc are numbers
    number = Number(tokens[i + 1]);
    // first we check is the operator multiplier or divider
    if (operator === '×' || operator === '/') {
      // we get the first value by removing it from the array. It as well clears the array
      const prev = Number(array1.pop());
      array1.push(operator === '×' ? prev * number : prev / number);
    } else {
      // if operator is not multiplier or divider, add the operator (for example: '+')
      // and the number into the array
      array1.push(operator, number);
    }
  }
  // when code gets here, the multipliers and dividers have been calculated
  // we know the first value is a number, we can set it here
  let result = Number(array1[0]);

  for (let i = 1; i < array1.length; i += 2) {
    const _operator = array1[i];
    const _number = Number(array1[i + 1]);
    result = _operator === '+' ? result + _number : result - _number;
  }
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
    input.focus();
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
      const answer = evaluate(normalizeSigns(tokenize(prev)));
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
        input.focus();
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
    <div>
      <div>
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
          className="mr-3 w-full rounded-sm border-2 text-end text-2xl caret-cyan-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          value={currentDraft === null ? '' : formatForDisplay(currentDraft)}
        />
      </div>
      <div className="flex flex-row border-2">
        <div className="w-max">
          <div>
            <Button onClick={() => addNumber('7')}>7</Button>
            <Button onClick={() => addNumber('8')}>8</Button>
            <Button onClick={() => addNumber('9')}>9</Button>
          </div>
          <div>
            <Button onClick={() => addNumber('4')}>4</Button>
            <Button onClick={() => addNumber('5')}>5</Button>
            <Button onClick={() => addNumber('6')}>6</Button>
          </div>
          <div>
            <Button onClick={() => addNumber('1')}>1</Button>
            <Button onClick={() => addNumber('2')}>2</Button>
            <Button onClick={() => addNumber('3')}>3</Button>
          </div>

          <div className="ml-5">
            <Button onClick={() => addNumber('0')}>0</Button>
            <Button onClick={() => addNumber('.')}>.</Button>
          </div>
        </div>
        <div>
          <div>
            <Button
              className="bg-blue-500 font-bold"
              onClick={() => setCurrentDraft(null)}
            >
              CE
            </Button>
            <Button className="bg-red-500 font-bold" onClick={removeNumber}>
              {'<-'}
            </Button>
          </div>
          <div>
            <Button className="bg-cyan-600" onClick={() => addNumber('×')}>
              ×
            </Button>
            <Button className="bg-pink-800" onClick={() => addNumber('/')}>
              /
            </Button>
          </div>
          <div>
            <Button className="bg-amber-500" onClick={() => addNumber('-')}>
              -
            </Button>
          </div>
          <div>
            <Button className="bg-orange-500" onClick={() => addNumber('+')}>
              +
            </Button>
            <Button
              className="absolute bottom-0 h-31 bg-green-500"
              onClick={calculateAnswer}
            >
              =
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button({
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        'm-1 h-14 w-14 cursor-pointer rounded-sm bg-cyan-300 text-2xl text-black hover:bg-cyan-500',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
