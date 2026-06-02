// components/multiplayer/MultiplayerBoard.tsx

'use client';
import {
  calculateWinner,
  isDraw,
  HUMAN,
  AI,
  calculateWinner5,
  calculateWinner10,
  Board as BoardType,
} from '@/lib/gameLogic';
import { usePartyRoom } from '@/hooks/multiplayer/usePartyRoom';
import Square from '../Square';
import WinningLine from '../WinningLine';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import { CELL_LABELS, PlayerNames } from '@/utils/types';
import MoveHistory from '../MoveHistory';
import ScoreBoard from '@/components/ScoreBoard';
import { useRouter } from 'next/navigation';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { useGameSettings } from '@/hooks/multiplayer/useGameSettings';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SettingsModal } from '@/components/SettingsModal';
import SvgSettings from '@/icons/settings';
import { RoomSettings } from '@/utils/multiplayer/multiplayerTypes';
import SeriesWinnerModal from '../SeriesWinnerModal';
import HourglassTimer from '../HourglassTimer';
import ReplayModal from '../ReplayModal';
import Button from '../utils/Button';

const BOARD_COLS = { '3': 3, '5': 5, '10': 10 } as const;

function checkWinner(board: BoardType, boardSize: RoomSettings['boardSize']) {
  if (boardSize === '3') return calculateWinner(board);
  if (boardSize === '5') return calculateWinner5(board);
  return calculateWinner10(board);
}

type Props = {
  roomId: string;
  isSpectator?: boolean;
  initialSettings?: RoomSettings;
};

export default function MultiplayerBoard({
  roomId,
  isSpectator,
  initialSettings,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWinStreakText, setShowWinStreakText] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [showSeriesWinnerModal, setShowSeriesWinnerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const router = useRouter();
  const [multiplayerProfile] = useLocalStorage('multiplayerProfile', {
    name: 'Davy Jones',
    icon: '☠️',
  });

  const {
    roomState,
    myPlayer,
    myId,
    opponentDisconnected,
    errorMessage,
    sendMove,
    sendRematch,
    sendCancelRematch,
  } = usePartyRoom(roomId, initialSettings, multiplayerProfile);
  const cols = BOARD_COLS[roomState?.settings.boardSize ?? '3'];
  const { gridRef, measurement } = useGridMeasure(cols);

  const {
    setIsArrowKeysEnabled,
    isArrowKeysEnabled,
    setIsAudioMuted,
    isAudioMuted,
    setVolume,
    volume,
    pointSystem,
    setPointSystem,
  } = useGameSettings();
  const { cannonAudio, creakAudio, splashAudio, playSound } = useGameAudio(
    volume,
    isAudioMuted,
  );

  const { setRef, handleKeyDown, activeIndex, focusCell } =
    useGridNavigation(cols);
  // useRef placed above !roomState to prevent error
  const prevStatusRef = useRef<string | null>(null);

  const timerEndsAt = roomState?.timerEndsAt ?? null;

  useEffect(() => {
    if (!timerEndsAt || !roomState?.settings.timerEnabled) return;

    function tick() {
      const remaining = Math.ceil((timerEndsAt! - Date.now()) / 1000);
      setTimeLeft(Math.max(0, remaining));
    }

    tick();
    const interval = setInterval(tick, 200); // 200ms per a tick for a smooth countdown
    return () => {
      clearInterval(interval);
      setTimeLeft(null);
    };
  }, [timerEndsAt, roomState?.settings.timerEnabled]);

  // useEffect placed above !roomState to prevent error
  useEffect(() => {
    if (!roomState) return;
    const { status, winner, forfeitWinner } = roomState;

    if (status === 'finished' && prevStatusRef.current !== 'finished') {
      if (winner || forfeitWinner) playSound(cannonAudio);
      else playSound(splashAudio);
    }
    prevStatusRef.current = status;
  }, [roomState?.status, cannonAudio, splashAudio, playSound]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!roomState?.winStreakPlayer) return;
    const showTimeout = setTimeout(() => setShowWinStreakText(true), 0);
    const hideTimeout = setTimeout(() => setShowWinStreakText(false), 3500);
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [roomState?.winStreakPlayer, setShowWinStreakText]);

  const seriesWinner = roomState?.seriesWinner ?? null;

  const prevSeriesWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset when seriesWinner clears (new series started)
    if (!seriesWinner) {
      prevSeriesWinnerRef.current = null;
    }

    if (seriesWinner === prevSeriesWinnerRef.current) return;

    prevSeriesWinnerRef.current = seriesWinner;

    // defer to avoid synchronous setState in effect
    const timeout = setTimeout(() => setShowSeriesWinnerModal(true), 0);
    return () => clearTimeout(timeout);
  }, [seriesWinner]);

  // ERROR MESSAGE
  if (errorMessage) {
    return (
      <RoomMessage
        message={`Error: ${errorMessage}`}
        onBack={() => router.push('/multiplayer/lobby')}
      />
    );
  }

  // ROOM IS NOT "ONLINE"
  if (!roomState) {
    return (
      <RoomMessage
        message="Connecting..."
        onBack={() => router.push('/multiplayer/lobby')}
      />
    );
  }

  const {
    board,
    currentPlayer,
    status,
    winner,
    winStreak,
    winStreakPlayer,
    scores,
    bestOfSeriesScores,
    moveHistory,
    players,
    settings,
    forfeitWinner,
  } = roomState;

  const squareSize =
    settings.boardSize === '10'
      ? 'sm'
      : settings.boardSize === '5'
      ? 'md'
      : undefined;

  const { line: winLine } = checkWinner(board, settings.boardSize);
  const draw = !winner && isDraw(board);
  const isMyTurn = status === 'playing' && currentPlayer === myPlayer;
  const latestSquareSeized =
    moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].index : null;

  const humanEntry = Object.values(players).find((p) => p.player === HUMAN);
  const aiEntry = Object.values(players).find((p) => p.player === AI);
  const playerIcons: Record<string, string> = {
    [HUMAN]: humanEntry?.icon ?? HUMAN,
    [AI]: aiEntry?.icon ?? AI,
  };
  const currentPlayerName =
    currentPlayer === HUMAN
      ? humanEntry?.name ?? 'Davy Jones'
      : aiEntry?.name ?? 'Capt. Hook';

  if (isSpectator && !settings.allowSpectators) {
    return (
      <RoomMessage
        message="👁️ Spectators are not allowed in this room."
        onBack={() => router.push('/multiplayer/lobby')}
      />
    );
  }

  // Does my opponent want a rematch?
  const opponentWantsRematch = Object.values(players).some(
    (p) => p.player !== myPlayer && p.wantsRematch,
  );

  // I want a rematch?
  const myWantsRematch = myPlayer
    ? players[myId]?.wantsRematch ?? false
    : false;

  function handleClick(index: number) {
    // board[index] added to prevent sound playing when clicking already taken square
    if (!isMyTurn || isSpectator || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    const { winner: predictedWinner } = checkWinner(
      newBoard,
      settings.boardSize,
    );
    const predictedDraw = !predictedWinner && isDraw(newBoard);

    // this if, else if, else blocks in winning situation to cannon and creak sound playing at the same time
    if (!predictedWinner && !predictedDraw) {
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Room code */}
      <p className="text-xs text-slate-400 dark:text-amber-600 uppercase tracking-widest">
        Room: <span className="font-mono font-bold">{roomId}</span>
      </p>

      {/* Exit button and Settings Button*/}
      <div className="relative flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/multiplayer/lobby')}
          className="text-xs px-0 py-0 text-slate-400 dark:text-amber-700"
        >
          ✕ Leave
        </Button>
        <Button
          variant="unstyled"
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          className="relative"
          onClick={() => setShowSettingsModal(true)}
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </Button>
      </div>

      {/* Waiting state */}
      {status === 'waiting' && !isSpectator && (
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
        mode="pvp"
        myPlayer={myPlayer}
        scores={scores}
        bestOfSeriesScores={bestOfSeriesScores}
        pointSystem={pointSystem}
        bestOfSeries={settings.bestOfSeries}
        playerOneOverride={
          humanEntry
            ? { name: humanEntry.name, icon: humanEntry.icon }
            : undefined
        }
        playerTwoOverride={
          aiEntry ? { name: aiEntry.name, icon: aiEntry.icon } : undefined
        }
      />

      {/* Win streak badge */}
      {winStreakPlayer && showWinStreakText && (
        <div className="animate-bounce bg-amber-500 border-2 border-amber-700 text-white dark:bg-yellow-600 dark:border-yellow-400 dark:text-black font-bold px-4 py-2 rounded-lg text-center text-lg shadow-lg">
          {playerIcons[winStreakPlayer]} {winStreak[winStreakPlayer]} in a row!
          🔥
        </div>
      )}

      {/* Spectator banner */}
      {isSpectator && (
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold tracking-widest uppercase">
          👁️ Spectating
        </p>
      )}

      {/* Turn indicator */}
      {status === 'playing' && !isSpectator && (
        <p className="font-semibold dark:text-yellow-300">
          {isMyTurn ? '⚔️ Your turn' : "⏳ Opponent's turn"}
        </p>
      )}

      {/* Sand Timer */}

      {roomState.settings.timerEnabled && timeLeft !== null && (
        <HourglassTimer
          timeLeft={timeLeft}
          duration={roomState.settings.timerDuration}
        />
      )}

      {/* For spectators show whose turn it is instead */}
      {status === 'playing' && isSpectator && (
        <p className="font-semibold dark:text-yellow-300">
          ⚔️ {currentPlayerName}&apos;s turn {currentPlayer}
        </p>
      )}

      {/* Grid */}
      <div className="relative">
        <div
          ref={gridRef}
          className={`grid ${
            settings.boardSize === '10'
              ? 'grid-cols-10 gap-1'
              : settings.boardSize === '5'
              ? 'grid-cols-5 gap-2'
              : 'grid-cols-3 gap-3'
          }`}
        >
          {board.map((cell, i) => (
            <Square
              key={i}
              value={cell}
              displayValue={cell ? playerIcons[cell] : undefined}
              onClick={() => handleClick(i)}
              onKeyDown={(e) =>
                isArrowKeysEnabled ? handleKeyDown(e, i) : null
              }
              isWinning={winLine?.includes(i) ?? false}
              isLatestMove={i === latestSquareSeized}
              disabled={
                !isMyTurn || status !== 'playing' || !!board[i] || !!isSpectator
              }
              tabIndex={i === activeIndex.current ? 0 : -1}
              cellRef={(el) => setRef(el, i)}
              label={`${CELL_LABELS[i]}, ${cell ?? 'empty'}`}
              size={squareSize}
            />
          ))}
        </div>
        {winner && winLine && (
          <WinningLine
            winLine={winLine}
            cellSize={measurement.cellSize}
            gap={measurement.gap}
            cols={cols}
          />
        )}
      </div>

      {/* Series Winner Modal */}

      {showSeriesWinnerModal && seriesWinner && (
        <SeriesWinnerModal
          seriesWinner={seriesWinner}
          mode="pvp"
          isWinner={isSpectator ? undefined : seriesWinner === myPlayer}
          onClose={() => setShowSeriesWinnerModal(false)}
          playerOneOverride={
            humanEntry
              ? { name: humanEntry.name, icon: humanEntry.icon }
              : undefined
          }
          playerTwoOverride={
            aiEntry ? { name: aiEntry.name, icon: aiEntry.icon } : undefined
          }
        />
      )}

      {/* Spectator's Game Over */}

      {status === 'finished' && isSpectator && (
        <p className="text-xl font-bold dark:text-yellow-300">
          {winner ? `🏆 ${PlayerNames[winner]} wins!` : '🌊 Draw!'}
        </p>
      )}

      {/* Replay Modal */}

      {showReplayModal && (
        <ReplayModal
          onClose={() => setShowReplayModal(false)}
          moveHistory={moveHistory}
          playerIcons={playerIcons}
        />
      )}

      {/* Game over */}
      {status === 'finished' && !isSpectator && (
        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-xl font-bold dark:text-yellow-300">
            {draw
              ? '🌊 Draw!'
              : winner === myPlayer || forfeitWinner === myPlayer
              ? '🏆 You win!'
              : '💀 You lose!'}
          </p>
          <Button
            variant="gold"
            onClick={() => {
              if (myWantsRematch) {
                sendCancelRematch();
                return;
              }
              sendRematch();
            }}
          >
            {opponentWantsRematch && myWantsRematch
              ? '✅ Both ready — Starting game!'
              : opponentWantsRematch
              ? '✅ Opponent ready — Start rematch!'
              : myWantsRematch
              ? '✕ Cancel Rematch Request'
              : '🔁 Request Rematch'}
          </Button>
          <Button
            variant="gold"
            aria-label="Replay the game"
            onClick={() => setShowReplayModal(true)}
            className="tracking-wide"
          >
            ▶ Replay game ◀
          </Button>
        </div>
      )}

      {/* Move history */}
      <MoveHistory
        mode="pvp"
        moveHistory={moveHistory}
        winner={winner}
        isDraw={draw}
      />

      {/* Settings Modal */}

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
        pointSystem={pointSystem}
        setPointSystem={setPointSystem}
      />
    </div>
  );
}

function RoomMessage({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center dark:text-yellow-300">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="text-black dark:text-red-500 dark:hover:text-red-600"
        onClick={onBack}
      >
        Back to lobby
      </Button>
    </div>
  );
}
