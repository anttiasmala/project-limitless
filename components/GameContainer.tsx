'use client';

import { Player } from '@/lib/gameLogic';
import { useState } from 'react';
import Board from './Board';
import ResetScore from './ResetScore';

const INITIAL_SCORE: Record<Player, number> = { '☠️': 0, '⚓': 0 };
export const HUMAN: Player = '☠️';
export const AI: Player = '⚓';

export default function GameContainer() {
  const [scores, setScores] = useState(INITIAL_SCORE);

  return (
    <>
      <div className="bg-amber-950/40 border-2 border-amber-800 rounded-2xl p-8 shadow-[0_0_40px_#451a0360] backdrop-blur-sm">
        <Board scores={scores} setScores={setScores} />
      </div>

      <div className="bg-amber-950/40 border-2 border-amber-800 rounded-2xl p-2 shadow-[0_0_40px_#451a0360] backdrop-blur-sm text-amber-500 hover:border-amber-600 ">
        <ResetScore
          onReset={() => {
            if (scores[HUMAN] === 0 && scores[AI] === 0) return;
            setScores(INITIAL_SCORE);
          }}
        />
      </div>
    </>
  );
}
