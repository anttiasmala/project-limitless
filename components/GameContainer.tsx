'use client';

import { AI, HUMAN, INITIAL_SCORE } from '@/lib/gameLogic';
import { useEffect, useState } from 'react';
import Board from './Board';
import ResetScore from './ResetScore';

export default function GameContainer() {
  const [scores, setScores] = useState({ ...INITIAL_SCORE });

  useEffect(() => {
    const _scores = localStorage.getItem('scores');
    if (!_scores) return;
    setTimeout(() => setScores(JSON.parse(_scores)), 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores));
  }, [scores]);

  return (
    <>
      <div className="bg-amber-950/40 border-2 border-amber-800 rounded-2xl p-8 shadow-[0_0_40px_#451a0360] backdrop-blur-sm">
        <Board scores={scores} setScores={setScores} />
      </div>

      <div>
        <ResetScore
          onReset={() => {
            if (scores[HUMAN] === 0 && scores[AI] === 0) return;
            localStorage.setItem('scores', JSON.stringify(INITIAL_SCORE));
            setScores({ ...INITIAL_SCORE });
          }}
        />
      </div>
    </>
  );
}
