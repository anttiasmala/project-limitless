'use client';

type ResetScoreProps = {
  onReset: () => void;
};

export default function ResetScore({ onReset }: ResetScoreProps) {
  return (
    <div>
      <button onClick={onReset} className="cursor-pointer">
        Reset Score
      </button>
    </div>
  );
}
