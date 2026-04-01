// components/multiplayer/MultiplayerBoard.tsx

'use client';
import { calculateWinner, isDraw } from '@/lib/gameLogic';
import { usePartyRoom } from '@/hooks/multiplayer/usePartyRoom';
import Square from '../Square';
import WinningLine from '../WinningLine';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import { CELL_LABELS } from '@/utils/types';
import MoveHistory from '../MoveHistory';
import ScoreBoard from '@/components/multiplayer/ScoreBoard';
import { useRouter } from 'next/navigation';

type Props = {
  roomId: string;
};

export default function MultiplayerBoard({ roomId }: Props) {
  const router = useRouter();

  const {
    roomState,
    myPlayer,
    opponentDisconnected,
    errorMessage,
    sendMove,
    sendRematch,
  } = usePartyRoom(roomId);
  const { gridRef, measurement } = useGridMeasure(3);

  if (errorMessage) {
    return (
      <div>
        <p className="text-center text-red-500 dark:text-yellow-300">
          Error: {errorMessage}
        </p>
        <button
          className="text-black dark:text-red-500 dark:hover:text-red-600 cursor-pointer"
          onClick={() => router.push('/multiplayer/lobby')}
        >
          Back to lobby
        </button>
      </div>
    );
  }
  if (!roomState) {
    return (
      <div>
        <p className="text-center dark:text-yellow-300">Connecting...</p>
        <button
          className="text-black dark:text-red-500 dark:hover:text-red-600 cursor-pointer"
          onClick={() => router.push('/multiplayer/lobby')}
        >
          Back to lobby
        </button>
      </div>
    );
  }

  const { board, currentPlayer, status, winner, scores, moveHistory, players } =
    roomState;
  const { line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const isMyTurn = status === 'playing' && currentPlayer === myPlayer;
  // Does my opponent want a rematch?
  const opponentWantsRematch = Object.values(players).some(
    (p) => p.player !== myPlayer && p.wantsRematch,
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Room code */}
      <p className="text-xs text-slate-400 dark:text-amber-600 uppercase tracking-widest">
        Room: <span className="font-mono font-bold">{roomId}</span>
      </p>

      {/* Exit button */}
      <button
        onClick={() => router.push('/multiplayer/lobby')}
        className="text-xs text-slate-400 hover:text-red-500 dark:text-amber-700
      dark:hover:text-red-400 cursor-pointer transition-colors"
      >
        ✕ Leave
      </button>

      {/* Waiting state */}
      {status === 'waiting' && (
        <p className="text-amber-600 dark:text-yellow-300 font-semibold animate-pulse">
          ⏳ Waiting for opponent to join...
        </p>
      )}

      {/* Opponent disconnected */}
      {opponentDisconnected && (
        <p className="text-red-500 font-semibold">⚠️ Opponent disconnected</p>
      )}

      {/* Scoreboard */}
      <ScoreBoard
        myPlayer={myPlayer}
        scores={scores}
        bestOfSeriesScores={{ ['☠️']: 0, ['⚓']: 0 }}
        pointSystem="number"
        bestOfSeries="off"
      />

      {/* Turn indicator */}
      {status === 'playing' && (
        <p className="font-semibold dark:text-yellow-300">
          {isMyTurn ? '⚔️ Your turn' : "⏳ Opponent's turn"}
        </p>
      )}

      {/* Grid */}
      <div className="relative">
        <div ref={gridRef} className="grid grid-cols-3 gap-3">
          {board.map((cell, i) => (
            <Square
              key={i}
              value={cell}
              onClick={() => isMyTurn && sendMove(i)}
              onKeyDown={() => null}
              isWinning={winLine?.includes(i) ?? false}
              disabled={!isMyTurn || status !== 'playing' || !!board[i]}
              tabIndex={-1}
              cellRef={() => null}
              label={`${CELL_LABELS[i]}, ${cell ?? 'empty'}`}
            />
          ))}
        </div>
        {winner && winLine && (
          <WinningLine
            winLine={winLine}
            cellSize={measurement.cellSize}
            gap={measurement.gap}
          />
        )}
      </div>

      {/* Game over */}
      {status === 'finished' && (
        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-xl font-bold dark:text-yellow-300">
            {winner === myPlayer
              ? '🏆 You win!'
              : draw
              ? '🌊 Draw!'
              : '💀 You lose!'}
          </p>
          <button
            onClick={sendRematch}
            className="px-6 py-3 bg-amber-600 border-2 border-amber-800 text-white
              dark:bg-amber-700 dark:border-yellow-500 dark:text-yellow-300
              font-bold rounded-lg hover:bg-amber-500 cursor-pointer
              transition-all duration-200"
          >
            {opponentWantsRematch
              ? '✅ Opponent ready — Start rematch!'
              : '🔁 Request Rematch'}
          </button>
        </div>
      )}

      {/* Move history */}
      <MoveHistory
        moveHistory={moveHistory}
        mode="pvp"
        winner={winner}
        isDraw={draw}
      />
    </div>
  );
}
