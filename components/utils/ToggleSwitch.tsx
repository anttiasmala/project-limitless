// components/utils/ToggleSwitch.tsx

import styles from './ToggleSwitch.module.css';
import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ToggleSwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> & {
  /** Controls the overall dimensions of the switch. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Extra classes for the wrapping <label> (e.g. spacing, alignment). */
  className?: string;
  /** Extra classes for the track itself (e.g. override colors). */
  trackClassName?: string;
};

// Each size keeps the knob centered with a 2px (left/top-0.5) inset, and the
// checked translate equals trackWidth - knobWidth - 4px so it lands flush right.
const SIZES = {
  sm: {
    track: 'h-4 w-8',
    knob: 'after:left-0.5 after:top-0.5 after:h-3 after:w-3',
    translate: 'peer-checked:after:translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    knob: 'after:left-0.5 after:top-0.5 after:h-5 after:w-5',
    translate: 'peer-checked:after:translate-x-5',
  },
  lg: {
    track: 'h-8 w-14',
    knob: 'after:left-0.5 after:top-0.5 after:h-7 after:w-7',
    translate: 'peer-checked:after:translate-x-6',
  },
} as const;

export default function ToggleSwitch({
  size = 'md',
  className,
  trackClassName,
  ...rest
}: ToggleSwitchProps) {
  const _size = SIZES[size];
  return (
    <label
      className={twMerge(
        'relative inline-flex cursor-pointer items-center',
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        className={twMerge(
          // Track
          'relative rounded-full bg-slate-300 transition-colors duration-300 dark:bg-red-950',
          // Knob (pseudo-element so no extra DOM node)
          "after:absolute after:rounded-full after:bg-white after:transition-transform after:duration-300 after:content-['']",
          // Checked state
          'peer-checked:bg-amber-600 dark:peer-checked:bg-yellow-400',
          // Keyboard focus ring
          'peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:outline-none',
          _size.track,
          _size.knob,
          _size.translate,
          trackClassName,
        )}
      />
    </label>
  );
}

// All credits: https://uiverse.io/andrew-demchenk0/honest-stingray-90
export function ToggleSwitchDarkLightTheme({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={twMerge(styles.switch, className)}>
      <span className={styles.sun}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="#ffd43b">
            <circle r="5" cy="12" cx="12"></circle>
            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
          </g>
        </svg>
      </span>
      <span className={styles.moon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
        </svg>
      </span>
      <input type="checkbox" className={styles.input} {...rest} />
      <span className={styles.slider}></span>
    </label>
  );
}
