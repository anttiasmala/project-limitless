import { useEffect, useState } from 'react';
import Input from './Input';

type Props = {
  /** The committed numeric value. Driven by the parent's state. */
  value: number;
  /** Called on blur with the validated value. */
  onCommit: (value: number) => void;
  /** Value used when the field is left empty or otherwise invalid. */
  fallback: number;
  min?: number;
  className?: string;
  'aria-label'?: string;
};

// A controlled number field that lets the user type freely (including a
// transient empty string) and only commits a validated value on blur. Keeping
// the editable state internal — instead of an uncontrolled defaultValue — means
// the parent can change `value` (resetting settings, applying a preset) and the
// field updates without any remount-by-key trick.
export default function NumberInput({
  value,
  onCommit,
  fallback,
  min = 0,
  className,
  ...rest
}: Props) {
  const [draft, setDraft] = useState(String(value));

  // Re-sync when the value changes from outside this component.
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <Input
      type="number"
      min={min}
      value={draft}
      className={className}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = Number(draft);
        const next =
          Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
        // Re-sync so e.g. an empty input shows the fallback and "05" shows "5".
        setDraft(String(next));
        onCommit(next);
      }}
      {...rest}
    />
  );
}
