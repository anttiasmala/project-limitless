'use client';

import { AI, HUMAN, INITIAL_SCORE } from '@/lib/gameLogic';
import { useEffect, useState } from 'react';
import Board from './Board';
import ResetScore from './ResetScore';
import OceanBackground from './OceanBackground';

function usePersistedScore(key: string) {
  const [score, setScore] = useState({ ...INITIAL_SCORE });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setTimeout(() => setScore(JSON.parse(stored)), 0);
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(score));
  }, [key, score]);

  return [score, setScore] as const;
}

export default function GameContainer({
  isDarkTheme,
  setIsDarkTheme,
}: {
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
}) {
  const [scores, setScores] = usePersistedScore('scores');
  const [stormLevel, setStormLevel] = useState(0);
  const [bestOfSeriesScores, setBestOfSeriesScores] =
    usePersistedScore('bestOfSeriesScores');

  return (
    <>
      <div className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40 dark:border-amber-800 rounded-2xl p-4 sm:p-8 shadow-[0_0_40px_#94a3b820] dark:shadow-[0_0_40px_#451a0360] backdrop-blur-sm w-full">
        <Board
          scores={scores}
          setScores={setScores}
          bestOfSeriesScores={bestOfSeriesScores}
          setBestOfSeriesScores={setBestOfSeriesScores}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          onStormLevelChange={setStormLevel}
        />
      </div>

      <div>
        <ResetScore
          onReset={() => {
            if (scores[HUMAN] === 0 && scores[AI] === 0) return;
            setScores({ ...INITIAL_SCORE });
            setBestOfSeriesScores({ ...INITIAL_SCORE });
          }}
        />
      </div>
      <OceanBackground isDarkTheme={isDarkTheme} stormLevel={stormLevel} />
    </>
  );
}
