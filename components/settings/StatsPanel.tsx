// components/StatsPanel.tsx

import { WinLossDrawStats } from '@/utils/types';

function StatRow({
  icon,
  name,
  stats,
}: {
  icon: string;
  name: string;
  stats: { win: number; loss: number; draw: number };
}) {
  const total = stats.win + stats.loss + stats.draw;
  const winW = total === 0 ? 0 : (stats.win / total) * 100;
  const lossW = total === 0 ? 0 : (stats.loss / total) * 100;
  const drawW = total === 0 ? 0 : (stats.draw / total) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-base">{icon}</span>
        <span className="font-bold text-slate-700 dark:text-yellow-300 text-sm">
          {name}
        </span>
      </div>
      {total === 0 ? (
        <p className="text-xs text-slate-400 dark:text-red-300/60">
          No games recorded
        </p>
      ) : (
        <>
          <div className="flex h-2 rounded overflow-hidden mb-1">
            <div className="bg-green-500" style={{ width: `${winW}%` }} />
            <div className="bg-red-500" style={{ width: `${lossW}%` }} />
            <div className="bg-yellow-400" style={{ width: `${drawW}%` }} />
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400">
              W {stats.win} ({Math.round(winW)}%)
            </span>
            <span className="text-red-600 dark:text-red-400">
              L {stats.loss} ({Math.round(lossW)}%)
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              D {stats.draw} ({Math.round(drawW)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-red-300/60 mt-0.5">
            {total} games total
          </p>
        </>
      )}
    </div>
  );
}

export function StatsPanel({
  winLossDraw,
  playerOne,
  playerTwo,
  onResetStats,
}: {
  winLossDraw: WinLossDrawStats;
  playerOne: { icon: string; name: string };
  playerTwo: { icon: string; name: string };
  onResetStats?: () => void;
}) {
  return (
    <div className="w-72 max-w-[90vw] bg-white border-2 border-slate-300 dark:bg-red-900 dark:border-red-700 rounded-lg overflow-hidden">
      <div className="bg-slate-100 dark:bg-red-800 px-4 py-2 border-b border-slate-200 dark:border-red-700">
        <h3 className="text-center font-bold text-slate-700 dark:text-yellow-300 tracking-wide">
          📊 Battle Record
        </h3>
      </div>
      <div className="p-4">
        <StatRow
          icon={playerOne.icon}
          name={playerOne.name}
          stats={winLossDraw['☠️']}
        />
        <StatRow
          icon={playerTwo.icon}
          name={playerTwo.name}
          stats={winLossDraw['⚓']}
        />
        {onResetStats && (
          <button
            onClick={onResetStats}
            className="mt-1 w-full py-2 bg-slate-200 dark:bg-red-950 text-slate-700 dark:text-yellow-300/70 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-red-800 hover:text-slate-900 dark:hover:text-yellow-300 border-2 border-slate-300 dark:border-red-700 transition-all cursor-pointer text-xs"
          >
            🗑️ Reset Stats
          </button>
        )}
      </div>
    </div>
  );
}
