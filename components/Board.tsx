'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Square from './Square';
import GameStatus from './GameStatus';
import {
  Board as BoardType,
  Player,
  Difficulty,
  calculateWinner,
  isDraw,
  getAIMove,
  AI,
  HUMAN,
  INITIAL_SCORE,
} from '@/lib/gameLogic';
import SvgSettings from '@/icons/settings';
import WinningLine from './WinningLine';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import { CELL_LABELS, MoveEntry } from '@/utils/types';
import MoveHistory from './MoveHistory';
import { useTimer } from '@/hooks/useTimer';
import HourglassTimer from './HourglassTimer';
import KrakenAvatar from './KrakenAvatar';
import { getKrakenMood } from '@/utils/krakenMood';
import { SettingsModal } from './SettingsModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import TreasureChests from './TreasureChests';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

type BoardProps = {
  scores: Record<Player, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
};

const INITIAL_BOARD: BoardType = Array(9).fill(null);

export default function Board({
  scores,
  setScores,
  isDarkTheme,
  setIsDarkTheme,
}: BoardProps) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState<BoardType>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('☠️');
  const [starterPlayer, setStarterPlayer] = useState<Player>('☠️');

  const [mode, setMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);

  const [moveHistory, setMoveHistory] = useState<MoveEntry[]>([]);
  const [showForfeitMessage, setShowForfeitMessage] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage('muted', false);
  const [volume, setVolume] = useLocalStorage('volume', 0.5);
  const [timerEnabled, setTimerEnabled] = useLocalStorage(
    'timerEnabled',
    false,
  );
  const [isArrowKeysEnabled, setIsArrowKeysEnabled] = useLocalStorage(
    'arrowKeysEnabled',
    false,
  );
  const [pointSystem, setPointSystem] = useLocalStorage<
    'treasureChest' | 'number'
  >('pointSystem', 'number');

  const { winner, line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

  const { setRef, handleKeyDown, activeIndex, resetFocus, focusCell } =
    useGridNavigation(3);

  const krakenMood = getKrakenMood({
    winner,
    isDraw: draw,
    aiThinking,
    board,
    isGameStarted,
  });

  const cannonAudio = useRef<HTMLAudioElement | null>(null);
  const splashAudio = useRef<HTMLAudioElement | null>(null);
  const creakAudio = useRef<HTMLAudioElement | null>(null);

  const TIMER_DURATION = 10;

  const gameHasMoves = board.some((cell) => cell !== null);
  const isHumanTurn = !gameOver && (mode === 'pvp' || currentPlayer === HUMAN);

  // Measurement logic
  const { gridRef, measurement } = useGridMeasure(3);

  // Swipe Gestures
  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
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
    },
    [focusCell, activeIndex],
  );

  const { onTouchStart, onTouchEnd } = useSwipeNavigation(gridRef, handleSwipe);

  // Audio logic
  useEffect(() => {
    if (!cannonAudio.current) {
      cannonAudio.current = new Audio('/sounds/cannon.mp3');
    }
    if (!splashAudio.current) {
      splashAudio.current = new Audio('/sounds/splash.mp3');
    }
    if (!creakAudio.current) {
      creakAudio.current = new Audio('/sounds/creak.mp3');
    }

    [cannonAudio, splashAudio, creakAudio].forEach(
      (ref: React.RefObject<HTMLAudioElement | null>) => {
        if (ref.current) {
          ref.current.volume = volume;
          ref.current.muted = isAudioMuted;
        }
      },
    );
  }, [volume, isAudioMuted]);

  function playSound(ref: React.RefObject<HTMLAudioElement | null>) {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
    }
  }

  const { timeLeft, reset: resetTimer } = useTimer(
    timerEnabled && isHumanTurn && isGameStarted,
    TIMER_DURATION,
    handleForfeit,
  );

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(starterPlayer);
    setAiThinking(false);
    const aiStarts = mode === 'pvc' && starterPlayer === AI;
    setIsGameStarted(aiStarts);
    setMoveHistory([]);
    resetTimer();
    resetFocus(0);
    setShowForfeitMessage(false);
  }, [starterPlayer, mode, resetTimer, resetFocus]);

  // Reset forfeit message

  useEffect(() => {
    if (!showForfeitMessage) return;
    const timeout = setTimeout(() => resetGame(), 2000);
    return () => clearTimeout(timeout);
  }, [showForfeitMessage, resetGame]);

  // AI move logic

  useEffect(() => {
    if (mode !== 'pvc' || gameOver || currentPlayer !== AI || !isGameStarted)
      return;
    // this thinkingTimeout added to prevent ESLint error, but having the aiThinking to be set immediately
    const thinkingTimeout = setTimeout(() => setAiThinking(true), 0);

    const moveTimeout = setTimeout(() => {
      const move = getAIMove(board, AI, HUMAN, difficulty);
      const newBoard = [...board];
      newBoard[move] = AI;
      setBoard(newBoard);
      setIsGameStarted(true);

      setMoveHistory((prev) => [
        ...prev,
        { turn: prev.length + 1, player: AI, index: move },
      ]);

      const { winner: _winner } = calculateWinner(newBoard);
      const _isDraw = isDraw(newBoard);
      if (_winner) {
        playSound(cannonAudio);
        setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
      } else if (_isDraw) {
        playSound(splashAudio);
      } else {
        setCurrentPlayer(HUMAN);
        resetTimer();
      }
      setAiThinking(false);
    }, 400); // slight delay so it feels alive

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(moveTimeout);
    };
  }, [
    board,
    currentPlayer,
    mode,
    difficulty,
    gameOver,
    setScores,
    isGameStarted,
    resetTimer,
  ]);

  function handleForfeit() {
    // Treat forfeit as skipping — opponent wins the turn, or just end game
    const loser = currentPlayer;
    const opponent = loser === HUMAN ? AI : HUMAN;
    setScores((prev) => ({
      ...prev,
      [opponent]: prev[opponent] + 1,
    }));
    playSound(cannonAudio);
    // Mark board as full to trigger game-over state via a forced win
    // Simplest: just award the point and reset
    setShowForfeitMessage(true);
  }

  function handleClick(index: number) {
    if (board[index] || gameOver || aiThinking || showForfeitMessage) return;
    if (mode === 'pvc' && currentPlayer === AI) return;
    setIsGameStarted(true);
    setShowForfeitMessage(false);

    setMoveHistory((prev) => [
      ...prev,
      { turn: prev.length + 1, player: currentPlayer, index },
    ]);

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    resetTimer();

    if (isArrowKeysEnabled) {
      const nextEmpty = newBoard.findIndex(
        (cell, i) => i > index && cell === null,
      );
      const fallback = newBoard.findIndex((cell) => cell === null);
      const target = nextEmpty !== -1 ? nextEmpty : fallback;
      if (target !== -1) focusCell(target);
    }

    const { winner: _winner } = calculateWinner(newBoard);
    const _isDraw = isDraw(newBoard);

    // Game has no winner and is not draw, creak sound can be played
    if (!_winner && !_isDraw) {
      playSound(creakAudio);
    }
    if (_winner) {
      playSound(cannonAudio);
      setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
    } else if (_isDraw) {
      playSound(splashAudio);
    } else {
      setCurrentPlayer(
        mode === 'pvp' ? (currentPlayer === HUMAN ? AI : HUMAN) : AI,
      );
    }
  }

  function switchMode(newMode: 'pvp' | 'pvc') {
    if (gameHasMoves && !gameOver) return;
    setMode(newMode);
    setBoard(INITIAL_BOARD);
    setScores({ ...INITIAL_SCORE });
    setAiThinking(false);
    setMoveHistory([]);
    resetTimer();
    setShowForfeitMessage(false);

    if (newMode === 'pvc') {
      setStarterPlayer(HUMAN);
      setCurrentPlayer(HUMAN);
    }
    // this prevents game starting too early
    setIsGameStarted(false);
  }

  const DIFFICULTY_LABELS: Record<Difficulty, { short: string; long: string }> =
    {
      easy: { short: '🌊 Easy', long: '🌊 Calm Seas (Easy)' },
      medium: { short: '⛈️ Medium', long: '⛈️ Stormy Waters (Medium)' },
      hard: { short: '💀 Hard', long: "💀 Davy Jones' Wrath (Hard)" },
    };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      <div className="flex gap-3 pr-10 sm:pr-0">
        {(['pvp', 'pvc'] as const).map((_mode) => (
          <button
            key={_mode}
            onClick={() => switchMode(_mode)}
            aria-pressed={mode === _mode}
            aria-label={
              _mode === 'pvp' ? 'Two Pirates mode' : 'Versus the Kraken mode'
            }
            className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all duration-200
              ${
                mode === _mode
                  ? 'bg-amber-600 border-amber-800 text-white dark:bg-amber-700 dark:border-yellow-400 dark:text-yellow-300'
                  : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400 dark:hover:border-amber-600'
              }
            ${
              gameHasMoves && !gameOver
                ? 'cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {_mode === 'pvp' ? '⚔️ Two Pirates' : '🤖 Vs the Kraken'}
          </button>
        ))}
        <div className="relative flex flex-col items-center gap-6">
          <button
            aria-label="Open settings"
            aria-expanded={showSettingsModal}
            className="absolute -left-1.5 sm:left-3 top-0 cursor-pointer"
            onClick={() => setShowSettingsModal(true)}
          >
            <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
          </button>
        </div>
      </div>

      {/* Difficulty selector (only in PvC mode) */}
      {mode === 'pvc' && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-slate-500 dark:text-amber-500 text-xs uppercase tracking-widest">
            Kraken Strength
          </span>
          <div className="flex gap-2 flex-wrap justify-center">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((_difficulty) => (
              <button
                key={_difficulty}
                onClick={() => {
                  if (gameHasMoves && !gameOver) return;
                  setDifficulty(_difficulty);
                  if (difficulty !== _difficulty) {
                    setScores({ ...INITIAL_SCORE });
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border-2 font-semibold text-xs transition-all duration-200
                  ${
                    difficulty === _difficulty
                      ? 'bg-amber-600 border-amber-800 text-white dark:bg-red-900 dark:border-red-500 dark:text-yellow-300'
                      : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 dark:hover:border-amber-600'
                  }
                  ${
                    gameHasMoves && difficulty !== _difficulty && !gameOver
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }    
                  `}
              >
                <span className="sm:hidden">
                  {DIFFICULTY_LABELS[_difficulty].short}
                </span>
                <span className="hidden sm:inline">
                  {DIFFICULTY_LABELS[_difficulty].long}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div
        aria-label={`Scores: ${mode === 'pvc' ? 'You' : 'Davy Jones'} ${
          scores[HUMAN]
        }, ${mode === 'pvc' ? 'Kraken' : 'Captain Hook'} ${scores[AI]}`}
        role="region"
        className="bg-white/60 border border-slate-300 text-slate-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 flex gap-4 sm:gap-8 text-lg font-semibold rounded-xl sm:px-8 px-4 py-3"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500 dark:text-amber-500 uppercase tracking-widest">
            {mode === 'pvc' ? '☠️ You' : '☠️ Davy Jones'}
          </span>
          {pointSystem === 'number' ? (
            <p>{scores[HUMAN]}</p>
          ) : (
            <TreasureChests count={scores[HUMAN]} />
          )}
        </div>
        <span className="text-slate-400 dark:text-amber-600 self-center">
          |
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs dark:text-amber-500 text-amber-700 uppercase tracking-widest">
            {mode === 'pvc' ? '⚓ Kraken' : '⚓ Capt. Hook'}
          </span>
          {pointSystem === 'number' ? (
            <p>{scores[AI]}</p>
          ) : (
            <TreasureChests count={scores[AI]} />
          )}
        </div>
      </div>

      {/* Game Starter */}
      {(!isGameStarted || gameOver) && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-slate-500 dark:text-amber-500 text-xs uppercase tracking-widest">
            Who sails first?
          </span>
          <div className="relative flex bg-white border border-slate-300 dark:bg-amber-950/60 dark:border-amber-800 rounded-full p-1 gap-1">
            {/* Sliding pill background */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-amber-600 border border-amber-800 dark:bg-amber-700 dark:border-yellow-500 shadow-inner transition-transform duration-300 ease-in-out"
              style={{
                transform:
                  starterPlayer === AI
                    ? 'translateX(calc(100%))'
                    : 'translateX(0)',
              }}
            />
            {([HUMAN, AI] as Player[]).map((player) => (
              <button
                key={player}
                onClick={() => {
                  if (starterPlayer === player || aiThinking) return;
                  setStarterPlayer(player);
                  setCurrentPlayer(player);
                  if (mode === 'pvc' && player === AI) setIsGameStarted(true);
                }}
                className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-bold
            transition-colors duration-200
            ${
              starterPlayer === player
                ? 'text-white dark:text-yellow-300'
                : 'text-slate-500 dark:text-amber-500 hover:text-slate-700 dark:hover:text-amber-300'
            }
            ${aiThinking ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
              >
                {player === HUMAN
                  ? mode === 'pvc'
                    ? '☠️ You'
                    : '☠️ Pirate'
                  : mode === 'pvc'
                  ? '⚓ Kraken'
                  : '⚓ Anchor'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <GameStatus
        winner={winner}
        isDraw={draw}
        currentPlayer={currentPlayer}
        mode={mode}
        aiThinking={aiThinking}
        showForfeitMessage={showForfeitMessage}
      />

      {/* Kraken mood */}

      {mode === 'pvc' && <KrakenAvatar mood={krakenMood} />}

      {/* Hourglass timer */}
      {timerEnabled && isHumanTurn && isGameStarted && (
        <HourglassTimer timeLeft={timeLeft} duration={TIMER_DURATION} />
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
              disabled={
                gameOver ||
                aiThinking ||
                (mode === 'pvc' && currentPlayer === AI)
              }
              tabIndex={i === activeIndex.current ? 0 : -1}
              cellRef={(el) => setRef(el, i)}
              label={`${CELL_LABELS[i]}, ${
                cell ? (cell === HUMAN ? 'skull' : 'anchor') : 'empty'
              }`}
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

      {/* Reset Game*/}
      <button
        onClick={resetGame}
        aria-label="Start a new game"
        className="mt-4 px-6 py-3 bg-red-700 border-2 border-red-900 text-white
      dark:bg-red-900 dark:border-red-700 dark:text-yellow-300
        font-bold rounded-lg hover:bg-red-600 dark:hover:bg-red-800
      hover:border-red-700 dark:hover:border-yellow-500 cursor-pointer
        transition-all duration-200 text-lg tracking-wide"
      >
        🏴‍☠️ New Voyage
      </button>
      {/* Sidebar */}
      <MoveHistory
        moveHistory={moveHistory}
        mode={mode}
        winner={winner}
        isDraw={draw}
      />
      {/* Settings Modal */}
      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        volume={volume}
        setVolume={setVolume}
        AudioArray={[cannonAudio, splashAudio, creakAudio]}
        timerEnabled={timerEnabled}
        setTimerEnabled={setTimerEnabled}
        pointSystem={pointSystem}
        setPointSystem={setPointSystem}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
        isArrowKeysEnabled={isArrowKeysEnabled}
        setIsArrowKeysEnabled={setIsArrowKeysEnabled}
      />
    </div>
  );
}
