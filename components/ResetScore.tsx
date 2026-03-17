'use client';

type ResetScoreProps = {
  onReset: () => void;
};

export default function ResetScore({ onReset }: ResetScoreProps) {
  return (
    <div>
      <button
        onClick={onReset}
        className="cursor-pointer bg-amber-950/40 border-2 border-amber-800 rounded-2xl p-2 shadow-[0_0_40px_#451a0360] backdrop-blur-sm text-amber-500 hover:border-amber-600"
      >
        Reset Score
      </button>
    </div>
  );
}
