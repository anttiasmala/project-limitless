// components/calculator/Calculator.tsx

'use client';

// Placeholder calculator. The structure (route + component folder) is in place so
// the real calculator logic can be built here without touching the rest of the app.
export default function Calculator() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="rounded-lg bg-slate-100 px-4 py-6 text-right text-3xl font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
        0
      </div>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        🧮 Calculator coming soon — build the logic here.
      </p>
    </div>
  );
}
