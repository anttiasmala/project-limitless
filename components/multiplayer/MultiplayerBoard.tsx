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
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { useGameSettings } from '@/hooks/multiplayer/useGameSettings';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useEffect, useRef, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import SvgSettings from '@/icons/settings';

type Props = {
  roomId: string;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
};

export default function MultiplayerBoard({
  roomId,
  isDarkTheme,
  setIsDarkTheme,
}: Props) {
  const router = useRouter();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const {
    roomState,
    myPlayer,
    opponentDisconnected,
    errorMessage,
    sendMove,
    sendRematch,
  } = usePartyRoom(roomId);
  const { gridRef, measurement } = useGridMeasure(3);

  const {
    setIsArrowKeysEnabled,
    isArrowKeysEnabled,
    setIsAudioMuted,
    isAudioMuted,
    setVolume,
    volume,
  } = useGameSettings();
  const { cannonAudio, creakAudio, splashAudio, playSound } = useGameAudio(
    volume,
    isAudioMuted,
  );

  const { setRef, handleKeyDown, activeIndex, focusCell } =
    useGridNavigation(3);
  const { onTouchStart, onTouchEnd } = useSwipeNavigation(gridRef, handleSwipe);
  // useRef placed above !roomState to prevent error
  const prevStatusRef = useRef<string | null>(null);

  // useEffect placed above !roomState to prevent error
  useEffect(() => {
    if (!roomState) return;
    const { status, winner } = roomState;

    if (status === 'finished' && prevStatusRef.current !== 'finished') {
      // Only play for the opponent (the one who didn't make the last move)
      if (!isMyTurn) {
        if (winner) playSound(cannonAudio);
        else playSound(splashAudio);
      }
    }
    prevStatusRef.current = status;
  }, [roomState?.status]);

  // ROOM IS NOT "ONLINE"
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

  // Swipe Gestures
  function handleSwipe(direction: 'left' | 'right' | 'up' | 'down') {
    const current = activeIndex.current;
    const col = current % 3;
    const row = Math.floor(current / 3);

    const next = {
      left: col > 0 ? current - 1 : current,
      right: col < 2 ? current + 1 : current,
      up: row > 0 ? current - 3 : current,
      down: row < 2 ? current + 3 : current,
    }[direction];

    if (next !== current) focusCell(next);
  }

  function handleClick(index: number) {
    if (!isMyTurn) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    const { winner: predictedWinner } = calculateWinner(newBoard);
    const predictedDraw = !predictedWinner && isDraw(newBoard);

    if (predictedWinner) {
      playSound(cannonAudio);
    } else if (predictedDraw) {
      playSound(splashAudio);
    } else {
      playSound(creakAudio);
    }

    if (isArrowKeysEnabled) {
      const nextEmpty = newBoard.findIndex(
        (cell, i) => i > index && cell === null,
      );
      const fallback = newBoard.findIndex((cell) => cell === null);
      const target = nextEmpty !== -1 ? nextEmpty : fallback;
      if (target !== -1) focusCell(target);
    }

    sendMove(index);
  }

  // ERROR MESSAGE
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Room code */}
      <p className="text-xs text-slate-400 dark:text-amber-600 uppercase tracking-widest">
        Room: <span className="font-mono font-bold">{roomId}</span>
      </p>

      {/* Exit button and Settings Button*/}
      <div className="relative flex items-center gap-6">
        <button
          onClick={() => router.push('/multiplayer/lobby')}
          className="text-xs text-slate-400 hover:text-red-500 dark:text-amber-700
      dark:hover:text-red-400 cursor-pointer transition-colors"
        >
          ✕ Leave
        </button>
        <button
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          className="relative cursor-pointer"
          onClick={() => setShowSettingsModal(true)}
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </button>
      </div>

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
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-3"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {board.map((cell, i) => (
            <Square
              key={i}
              value={cell}
              onClick={() => handleClick(i)}
              onKeyDown={(e) =>
                isArrowKeysEnabled ? handleKeyDown(e, i) : null
              }
              isWinning={winLine?.includes(i) ?? false}
              disabled={!isMyTurn || status !== 'playing' || !!board[i]}
              tabIndex={i === activeIndex.current ? 0 : -1}
              cellRef={(el) => setRef(el, i)}
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          AudioArray={[creakAudio, splashAudio, cannonAudio]}
          setShowSettingsModal={setShowSettingsModal}
          showSettingsModal={showSettingsModal}
          setIsArrowKeysEnabled={setIsArrowKeysEnabled}
          isArrowKeysEnabled={isArrowKeysEnabled}
          setIsAudioMuted={setIsAudioMuted}
          isAudioMuted={isAudioMuted}
          setVolume={setVolume}
          volume={volume}
          setIsDarkTheme={setIsDarkTheme}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
}
