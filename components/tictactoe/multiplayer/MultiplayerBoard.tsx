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
import { CELL_LABELS, PlayerNames } from '@/utils/tictactoe/types';
import MoveHistory from '../MoveHistory';
import ScoreBoard from '@/components/tictactoe/ScoreBoard';
import { useRouter } from 'next/navigation';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { useGameSettings } from '@/hooks/multiplayer/useGameSettings';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SettingsModal } from '@/components/tictactoe/SettingsModal';
import SvgSettings from '@/icons/settings';
import {
  RoomSettings,
  GAME_PASSWORD_MESSAGES,
} from '@/utils/tictactoe/multiplayer/multiplayerTypes';
import SeriesWinnerModal from '../SeriesWinnerModal';
import HourglassTimer from '../HourglassTimer';
import ReplayModal from '../ReplayModal';
import Button from '@/components/shared/Button';
import ShowEmoji from './utils/ShowEmoji';
import { toast } from 'react-toastify';
import Chat from './utils/Chat';
import Input from '@/components/shared/Input';
import SvgEyeOpen from '@/icons/eye_open';
import SvgEyeSlash from '@/icons/eye_slash';

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
  const [showSendEmojiModal, setShowSendEmojiModal] = useState(false);
  const router = useRouter();
  const [multiplayerProfile] = useLocalStorage('multiplayerProfile', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    roomState,
    myPlayer,
    myId,
    opponentDisconnected,
    errorMessage,
    infoMessage,
    gamePasswordMessage,
    sendMove,
    sendRematch,
    sendCancelRematch,
    sendEmoji,
    sendChat,
    sendGamePassword,
  } = usePartyRoom(
    roomId,
    initialSettings,
    multiplayerProfile,
    ({ emoji, isMe, isSpectator, whoReacted }) => {
      const spectatorText =
        whoReacted?.name && whoReacted?.icon
          ? `${whoReacted.icon} ${whoReacted.name} reacted: ${emoji}`
          : `Player reacted: ${emoji}`;
      toast(
        isMe
          ? `You reacted: ${emoji}`
          : isSpectator
            ? spectatorText
            : `Opponent reacted: ${emoji}`,
      );
    },
  );
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

    // Arrow function (not a hoisted declaration) so TS keeps the non-null
    // narrowing of timerEndsAt from the guard above.
    const tick = () => {
      // Keep the fractional remaining so the progress bar moves smoothly;
      // HourglassTimer rounds it up for the displayed seconds.
      const remaining = (timerEndsAt - Date.now()) / 1000;
      setTimeLeft(Math.max(0, remaining));
    };

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

  useEffect(() => {
    // "Password required!" is already shown as the form heading, so toasting it
    // would be redundant. We only toast "Invalid password!", which is the sole
    // feedback that a submitted password was wrong (the heading doesn't change).
    if (gamePasswordMessage?.message === GAME_PASSWORD_MESSAGES.required)
      return;
    toast(gamePasswordMessage?.message);
  }, [gamePasswordMessage]);

  // ERROR MESSAGE
  if (errorMessage) {
    return (
      <RoomMessage
        message={`Error: ${errorMessage}`}
        onBack={() => router.push('/tictactoe/multiplayer/lobby')}
      />
    );
  }

  // INFO MESSAGE
  if (infoMessage) {
    return (
      <RoomMessage
        message={infoMessage}
        onBack={() => router.push('/tictactoe/multiplayer/lobby')}
      />
    );
  }

  // GAME-PASSWORD MESSAGE

  if (gamePasswordMessage) {
    return (
      <div className="flex flex-col items-center gap-5">
        <h2 className="text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
          🔒 {GAME_PASSWORD_MESSAGES.required}
        </h2>
        <form
          className="flex w-full max-w-xs flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length > 0) {
              sendGamePassword(password);
            }
            setPassword('');
            // this makes passwordInput active after submitting (if password is wrong)
            document.getElementById('passwordInput')?.focus();
          }}
        >
          <label
            htmlFor="passwordInput"
            className="font-semibold text-slate-700 dark:text-yellow-300"
          >
            Password:
          </label>
          <div className="flex flex-1 rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400 dark:border-amber-700 dark:bg-amber-900 dark:text-yellow-300">
            <Input
              id="passwordInput"
              type={showPassword ? 'text' : 'password'}
              className="w-full border-0 px-3 py-2 outline-0 focus:outline-0 dark:border-amber-700 dark:bg-amber-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              aria-label="Show or hide password"
              variant="unstyled"
              onClick={() => setShowPassword((prevValue) => !prevValue)}
              title="Show or hide password"
            >
              {showPassword ? (
                <SvgEyeSlash className="h-8 w-8" />
              ) : (
                <SvgEyeOpen className="h-8 w-8" />
              )}
            </Button>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => router.push('/tictactoe/multiplayer/lobby')}
            >
              ← Back to lobby
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Login
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ROOM IS NOT "ONLINE"
  if (!roomState) {
    return (
      <RoomMessage
        message="Connecting..."
        onBack={() => router.push('/tictactoe/multiplayer/lobby')}
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
      ? (humanEntry?.name ?? 'Davy Jones')
      : (aiEntry?.name ?? 'Capt. Hook');

  // When both players pick the same icon the emoji alone can't tell the sides
  // apart, so the board falls back to colour-coding each owner's squares.
  const iconsClash =
    !!humanEntry && !!aiEntry && humanEntry.icon === aiEntry.icon;

  if (isSpectator && !settings.allowSpectators) {
    return (
      <RoomMessage
        message="👁️ Spectators are not allowed in this room."
        onBack={() => router.push('/tictactoe/multiplayer/lobby')}
      />
    );
  }

  // Does my opponent want a rematch?
  const opponentWantsRematch = Object.values(players).some(
    (p) => p.player !== myPlayer && p.wantsRematch,
  );

  // I want a rematch?
  const myWantsRematch = myPlayer
    ? (players[myId]?.wantsRematch ?? false)
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
      {/* Chat — collapsible panel backed by shared room state */}
      <Chat
        isSpectator={isSpectator ?? false}
        messages={roomState.chatHistory}
        myId={myId}
        onSend={sendChat}
      />

      {/* Room code */}
      <CopyRoomCode roomId={roomId} />

      {/* Exit button and Settings Button*/}
      <div className="relative flex items-center gap-6">
        <Button
          variant="neutral"
          size="sm"
          onClick={() => router.push('/tictactoe/multiplayer/lobby')}
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
          <SvgSettings className="h-8 w-8 fill-none text-amber-700 dark:text-white" />
        </Button>
      </div>

      {/* Waiting state */}
      {status === 'waiting' && !isSpectator && (
        <p className="animate-pulse font-semibold text-amber-600 dark:text-yellow-300">
          ⏳ Waiting for opponent to join...
        </p>
      )}

      {/* Opponent disconnected */}
      {opponentDisconnected && (
        <p className="font-semibold text-red-500">⚠️ Opponent disconnected</p>
      )}

      {/* Scoreboard */}
      <ScoreBoard
        mode="pvp"
        myPlayer={myPlayer}
        scores={scores}
        bestOfSeriesScores={bestOfSeriesScores}
        pointSystem={pointSystem}
        bestOfSeries={settings.bestOfSeries}
        victoriesForAction={settings.victoriesForAction}
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
        <div className="animate-bounce rounded-lg border-2 border-amber-700 bg-amber-500 px-4 py-2 text-center text-lg font-bold text-white shadow-lg dark:border-yellow-400 dark:bg-yellow-600 dark:text-black">
          {playerIcons[winStreakPlayer]} {winStreak[winStreakPlayer]} in a row!
          🔥
        </div>
      )}

      {/* Spectator banner */}
      {isSpectator && (
        <p className="text-xs font-semibold tracking-widest text-amber-500 uppercase dark:text-amber-400">
          👁️ Spectating
        </p>
      )}

      {/* Turn indicator */}
      {status === 'playing' && !isSpectator && (
        <p className="font-semibold dark:text-yellow-300">
          {isMyTurn ? '⚔️ Your turn' : "⏳ Opponent's turn"}
        </p>
      )}

      {/* Same-icon colour legend — only when both players share an icon, so the
          board's owner tint stays readable. */}
      {iconsClash && (
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-slate-600 dark:text-amber-300">
          <span>Matching icons —</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-sky-400 bg-sky-200 dark:border-sky-600 dark:bg-sky-800" />
            {isSpectator
              ? (humanEntry?.name ?? 'Davy Jones')
              : myPlayer === HUMAN
                ? 'You'
                : 'Opponent'}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border border-yellow-400 bg-yellow-300 dark:border-yellow-500 dark:bg-yellow-600" />
            {isSpectator
              ? (aiEntry?.name ?? 'Capt. Hook')
              : myPlayer === AI
                ? 'You'
                : 'Opponent'}
          </span>
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
          ⚔️ {currentPlayerName}&apos;s turn {playerIcons[currentPlayer]}
        </p>
      )}

      {/* Grid */}
      <div className={`relative ${settings.boardSize === '3' ? '' : 'w-full'}`}>
        <div
          ref={gridRef}
          className={`grid ${
            settings.boardSize === '10'
              ? 'w-full grid-cols-10 gap-1'
              : settings.boardSize === '5'
                ? 'w-full grid-cols-5 gap-2'
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
              tintByOwner={iconsClash}
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
          tintByOwner={iconsClash}
        />
      )}

      {/* Game over */}
      {status === 'finished' && !isSpectator && (
        <div className="flex flex-col items-center gap-3 text-center">
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

      {/* Send emoji / chat */}
      {!isSpectator && (
        <Button onClick={() => setShowSendEmojiModal(true)}>
          Send Emoji 😀
        </Button>
      )}

      {showSendEmojiModal && (
        <ShowEmoji
          onClose={() => setShowSendEmojiModal(false)}
          open={showSendEmojiModal}
          sendEmoji={sendEmoji}
        />
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

function CopyRoomCode({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
    } catch {
      // Clipboard unavailable (denied permission / non-secure context) —
      // leave the code on screen so it can be copied manually.
    }
  }

  return (
    <p className="flex items-center gap-2 text-xs tracking-widest text-slate-400 uppercase dark:text-amber-600">
      Room:{' '}
      <Button
        variant="unstyled"
        aria-label="Copy room code"
        className="font-mono font-bold hover:text-amber-700 dark:hover:text-yellow-300"
        onClick={handleCopy}
      >
        {roomId}
      </Button>
      <Button
        variant="unstyled"
        onClick={handleCopy}
        aria-label={copied ? 'Room code copied' : 'Copy room code'}
        className="group relative inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-sm hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/40"
      >
        <span aria-hidden>{copied ? '✅' : '📋'}</span>
        <span className="pointer-events-none absolute -bottom-7 left-1/2 z-50 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] tracking-normal whitespace-nowrap text-white normal-case group-hover:block group-focus-visible:block">
          {copied ? 'Copied!' : 'Copy code'}
        </span>
      </Button>
    </p>
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
      <Button variant="neutral" size="sm" onClick={onBack}>
        ← Back to lobby
      </Button>
    </div>
  );
}
