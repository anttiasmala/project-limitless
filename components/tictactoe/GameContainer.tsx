// components/GameContainer.tsx

'use client';

import { AI, HUMAN, INITIAL_SCORE } from '@/lib/tictactoe/gameLogic';
import { useEffect, useState } from 'react';
import Board from './Board';
import ResetScore from './ResetScore';
import OceanBackground from './OceanBackground';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

export default function GameContainer() {
  const [scores, setScores] = usePersistedScore('scores');
  const [stormLevel, setStormLevel] = useState(0);
  const [bestOfSeriesScores, setBestOfSeriesScores] =
    usePersistedScore('bestOfSeriesScores');

  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);

  return (
    <>
      <div className="w-full rounded-2xl border-2 border-slate-300 bg-white/80 p-4 shadow-[0_0_40px_#94a3b820] backdrop-blur-sm sm:p-8 dark:border-amber-800 dark:bg-amber-950/40 dark:shadow-[0_0_40px_#451a0360]">
        <Board
          scores={scores}
          setScores={setScores}
          bestOfSeriesScores={bestOfSeriesScores}
          setBestOfSeriesScores={setBestOfSeriesScores}
          onStormLevelChange={setStormLevel}
        />
      </div>

      <div>
        <ResetScore
          onReset={() => {
            if (
              scores[HUMAN] === 0 &&
              scores[AI] === 0 &&
              bestOfSeriesScores[HUMAN] === 0 &&
              bestOfSeriesScores[AI] === 0
            )
              return;
            setScores({ ...INITIAL_SCORE });
            setBestOfSeriesScores({ ...INITIAL_SCORE });
          }}
        />
      </div>
      <OceanBackground isDarkTheme={isDarkTheme} stormLevel={stormLevel} />
    </>
  );
}
