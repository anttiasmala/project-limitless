// components/Board.tsx

'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Square from './Square';
import GameStatus from './GameStatus';
import {
  Board as BoardType,
  Player,
  Difficulty,
  calculateWinner,
  calculateWinner5,
  calculateWinner10,
  isDraw,
  getAIMove,
  getAIMove5,
  getAIMove10,
  AI,
  HUMAN,
  INITIAL_SCORE,
} from '@/lib/gameLogic';
import WinningLine from './WinningLine';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import {
  BestOfSeriesNames,
  CELL_LABELS,
  GameMode,
  INITIAL_WIN_LOSS_DRAW,
  MoveEntry,
  WinLossDrawStats,
} from '@/utils/types';
import { useTournament } from '@/hooks/useTournament';
import TournamentBracket from './TournamentBracket';
import TournamentResultModal from './TournamentResultModal';
import MoveHistory from './MoveHistory';
import { useTimer } from '@/hooks/useTimer';
import HourglassTimer from './HourglassTimer';
import KrakenAvatar from './KrakenAvatar';
import { getKrakenMood } from '@/utils/krakenMood';
import { SettingsModal } from './SettingsModal';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import SeriesWinnerModal from './SeriesWinnerModal';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameSettings } from '@/hooks/useGameSettings';
import { useWatchMode } from '@/hooks/useWatchMode';
import StarterPicker from './StarterPicker';
import ModeSelector from './ModeSelector';
import ScoreBoard from './ScoreBoard';
import DifficultySelector from './DifficultySelector';
import SpeedSelector from './SpeedSelector';
import ReplayModal from './ReplayModal';
import { getStormLevel } from '@/utils/stormLevel';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from './utils/Button';
import SvgSettings from '@/icons/settings';

type BoardProps = {
  scores: Record<Player, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  bestOfSeriesScores: Record<Player, number>;
  setBestOfSeriesScores: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
  onStormLevelChange: (level: number) => void;
};

function makeCellLabel(index: number, boardSize: 3 | 5 | 10): string {
  if (boardSize === 3) return CELL_LABELS[index] ?? `Cell ${index + 1}`;
  const row = String.fromCharCode(65 + Math.floor(index / boardSize));
  const col = (index % boardSize) + 1;
  return `${row}${col}`;
}

export default function Board({
  scores,
  setScores,
  bestOfSeriesScores,
  setBestOfSeriesScores,
  onStormLevelChange,
}: BoardProps) {
  const [boardSize, setBoardSize] = useState<3 | 5 | 10>(3);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState<BoardType>(Array(9).fill(null));
  const INITIAL_BOARD = useMemo<BoardType>(
    () => Array(boardSize * boardSize).fill(null),
    [boardSize],
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('☠️');
  const [starterPlayer, setStarterPlayer] = useState<Player>('☠️');

  const [mode, setMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);

  const [moveHistory, setMoveHistory] = useState<MoveEntry[]>([]);
  const latestSquareSeized =
    moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].index : null;
  const [showForfeitMessage, setShowForfeitMessage] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [winStreaks, setWinStreaks] = useState<Record<Player, number>>({
    '☠️': 0,
    '⚓': 0,
  });
  const [streakBadgePlayer, setStreakBadgePlayer] = useState<Player | null>(
    null,
  );
  const [winLossDraw, setWinLossDraw] = useLocalStorage<WinLossDrawStats>(
    'winLossDraw',
    INITIAL_WIN_LOSS_DRAW,
  );

  const router = useRouter();

  const {
    isAudioMuted,
    setIsAudioMuted,
    volume,
    setVolume,
    timerEnabled,
    setTimerEnabled,
    isArrowKeysEnabled,
    setIsArrowKeysEnabled,
    pointSystem,
    setPointSystem,
    bestOfSeries,
    setBestOfSeries,
    victoriesForAction,
    setVictoriesForAction,
    timerDuration,
    setTimerDuration,
  } = useGameSettings();

  const calcWinner = useCallback(
    (b: BoardType) =>
      boardSize === 10
        ? calculateWinner10(b)
        : boardSize === 5
        ? calculateWinner5(b)
        : calculateWinner(b),
    [boardSize],
  );
  const [playerOne] = useLocalStorage('playerOne', {
    name: 'Davy Jones',
    icon: '☠️',
  });
  const [playerTwoStored] = useLocalStorage('playerTwo', {
    name: 'Capt. Hook',
    icon: '⚓',
  });

  const { winner, line: winLine } = calcWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

  const { setRef, handleKeyDown, activeIndex, resetFocus, focusCell } =
    useGridNavigation(boardSize);

  const { cannonAudio, creakAudio, playSound, splashAudio } = useGameAudio(
    volume,
    isAudioMuted,
  );

  // Task 5: Watch reuses the ⚓-centric PvC path unchanged — storm rages when ⚓
  // wins, calm when it loses. getStormLevel/getKrakenMood stay untouched.
  const stormLevel = getStormLevel({
    board,
    winner,
    isDraw: draw,
    mode: mode === 'watch' || mode === 'tournament' ? 'pvc' : mode,
  });

  const showStarterSelection = !isGameStarted || gameOver;

  useEffect(() => {
    onStormLevelChange(stormLevel);
  }, [stormLevel, onStormLevelChange]);

  const krakenMood = getKrakenMood({
    winner,
    isDraw: draw,
    aiThinking,
    board,
    isGameStarted,
  });

  const gameHasMoves = board.some((cell) => cell !== null);
  const isHumanTurn =
    !gameOver &&
    mode !== 'watch' &&
    (mode === 'pvp' || currentPlayer === HUMAN);

  const SERIES_WINS_NEEDED = BestOfSeriesNames[bestOfSeries];
  const seriesWinner =
    bestOfSeries === 'off'
      ? null
      : bestOfSeriesScores[HUMAN] >= SERIES_WINS_NEEDED
      ? HUMAN
      : bestOfSeriesScores[AI] >= SERIES_WINS_NEEDED
      ? AI
      : null;

  const { gridRef, measurement } = useGridMeasure(boardSize);

  const handleForfeit = useCallback(() => {
    const opponent = currentPlayer === HUMAN ? AI : HUMAN;
    setScores((prev) => ({ ...prev, [opponent]: prev[opponent] + 1 }));
    playSound(cannonAudio);
    setShowForfeitMessage(true);
    setWinStreaks((prev) => ({
      ...prev,
      // opponent is the winner
      [opponent]: prev[opponent] + 1,
      [currentPlayer]: 0,
    }));

    const _nextGameStarter = starterPlayer === HUMAN ? AI : HUMAN;
    setCurrentPlayer(_nextGameStarter);
    setStarterPlayer(_nextGameStarter);
  }, [currentPlayer, starterPlayer, playSound, cannonAudio, setScores]);

  const { timeLeft, reset: resetTimer } = useTimer(
    timerEnabled && isHumanTurn && isGameStarted,
    timerDuration,
    handleForfeit,
  );

  // Wipe the per-match playing state (board, history, points-for-this-match,
  // timer). Used by tournament advance, draw replay, and switchMode.
  const resetMatchState = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setMoveHistory([]);
    setScores({ ...INITIAL_SCORE });
    resetTimer();
  }, [INITIAL_BOARD, setScores, resetTimer]);

  const {
    tournament,
    tournamentOutcome,
    opponent: tournamentOpponent,
    defeatedAtFinal,
    resolveDifficulty,
    begin: beginTournament,
    clear: clearTournament,
  } = useTournament({
    active: mode === 'tournament',
    winner,
    draw,
    gameOver,
    resetMatchState,
    setStarterPlayer,
    setCurrentPlayer,
  });

  // In tournament mode the AI side shows the current bracket opponent so the
  // board, status line, scoreboard, and move log all reflect who you're facing.
  const playerTwo = tournamentOpponent ?? playerTwoStored;
  const playerIcons = { '☠️': playerOne.icon, '⚓': playerTwo.icon } as Record<
    Player,
    string
  >;

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setAiThinking(false);
    // In watch mode the loop keeps running across games; PvC auto-starts only
    // when the Kraken (AI) is the starter.
    const startImmediately =
      mode === 'watch' ||
      ((mode === 'pvc' || mode === 'tournament') && starterPlayer === AI);
    setIsGameStarted(startImmediately);
    setMoveHistory([]);
    resetTimer();
    resetFocus(0);
    setShowForfeitMessage(false);
    setCurrentPlayer(starterPlayer);
  }, [INITIAL_BOARD, starterPlayer, mode, resetTimer, resetFocus]);

  function undoPreviousMove() {
    if (moveHistory.length === 0) return;
    const lastMoveData = moveHistory[moveHistory.length - 1];
    const newMoveHistory = moveHistory.slice(0, -1);
    const newBoard = [...board];
    newBoard[lastMoveData.index] = null;
    setMoveHistory(newMoveHistory);
    setBoard(newBoard);
    setCurrentPlayer((_currentPlayer) =>
      _currentPlayer === '☠️' ? '⚓' : '☠️',
    );
  }

  // moved upwards due to this error: Error: Cannot access variable before it is declared
  const handleScores = useCallback(
    (winner: Player, currentScores: Record<Player, number>) => {
      if (
        bestOfSeries === 'off' &&
        pointSystem === 'treasureChest' &&
        victoriesForAction !== 0 &&
        currentScores[winner] >= victoriesForAction
      ) {
        setScores({ ...INITIAL_SCORE });
        resetGame();
      }

      if (
        bestOfSeries !== 'off' &&
        victoriesForAction !== 0 &&
        currentScores[winner] >= victoriesForAction
      ) {
        setBestOfSeriesScores((prev) => ({
          ...prev,
          [winner]: prev[winner] + 1,
        }));
        setScores({ ...INITIAL_SCORE });
      }
    },
    [
      setScores,
      resetGame,
      setBestOfSeriesScores,
      bestOfSeries,
      pointSystem,
      victoriesForAction,
    ],
  );

  useEffect(() => {
    if (!showForfeitMessage) return;
    const timeout = setTimeout(() => resetGame(), 2000);
    return () => clearTimeout(timeout);
  }, [showForfeitMessage, resetGame]);

  // Hint flash — clear after 1.5s or when the board changes
  useEffect(() => {
    if (hintIndex === null) return;
    const timeout = setTimeout(() => setHintIndex(null), 1500);
    return () => clearTimeout(timeout);
  }, [hintIndex]);

  useEffect(() => {
    setHintIndex(null);
  }, [board]);

  function handleHint() {
    const move =
      boardSize === 10
        ? getAIMove10(board, HUMAN, AI, 'insane')
        : boardSize === 5
        ? getAIMove5(board, HUMAN, AI, 'insane')
        : getAIMove(board, HUMAN, AI, 'insane');
    setHintIndex(move);
  }

  useEffect(() => {
    if (winStreaks[HUMAN] === 3) setStreakBadgePlayer(HUMAN);
    else if (winStreaks[AI] === 3) setStreakBadgePlayer(AI);
  }, [winStreaks]);

  useEffect(() => {
    if (!streakBadgePlayer) return;
    const timeout = setTimeout(() => setStreakBadgePlayer(null), 3500);
    return () => clearTimeout(timeout);
  }, [streakBadgePlayer]);

  useEffect(() => {
    if (!winner && !draw) return;

    if (mode === 'pvc') {
      if (winner === AI) {
        setWinLossDraw((prev) => ({
          ...prev,
          '☠️': { ...prev['☠️'], loss: prev['☠️'].loss + 1 },
        }));
      } else if (draw) {
        setWinLossDraw((prev) => ({
          ...prev,
          '☠️': { ...prev['☠️'], draw: prev['☠️'].draw + 1 },
        }));
      } else {
        setWinLossDraw((prev) => ({
          ...prev,
          '☠️': { ...prev['☠️'], win: prev['☠️'].win + 1 },
        }));
      }
    } else if (mode === 'pvp') {
      if (draw) {
        setWinLossDraw((prev) => ({
          '⚓': { ...prev['⚓'], draw: prev['⚓'].draw + 1 },
          '☠️': { ...prev['☠️'], draw: prev['☠️'].draw + 1 },
        }));
      } else if (winner === '☠️') {
        setWinLossDraw((prev) => ({
          '⚓': { ...prev['⚓'], loss: prev['⚓'].loss + 1 },
          '☠️': { ...prev['☠️'], win: prev['☠️'].win + 1 },
        }));
      } else {
        setWinLossDraw((prev) => ({
          '⚓': { ...prev['⚓'], win: prev['⚓'].win + 1 },
          '☠️': { ...prev['☠️'], loss: prev['☠️'].loss + 1 },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, draw, mode]);

  // AI move logic
  useEffect(() => {
    if (
      (mode !== 'pvc' && mode !== 'tournament') ||
      gameOver ||
      currentPlayer !== AI ||
      !isGameStarted
    )
      return;
    const thinkingTimeout = setTimeout(() => setAiThinking(true), 0);

    const effectiveDifficulty = resolveDifficulty(difficulty);

    const moveTimeout = setTimeout(() => {
      const move =
        boardSize === 10
          ? getAIMove10(board, AI, HUMAN, effectiveDifficulty)
          : boardSize === 5
          ? getAIMove5(board, AI, HUMAN, effectiveDifficulty)
          : getAIMove(board, AI, HUMAN, effectiveDifficulty);

      const newBoard = [...board];
      newBoard[move] = AI;
      setBoard(newBoard);
      setIsGameStarted(true);

      setMoveHistory((prev) => [
        ...prev,
        { turn: prev.length + 1, player: AI, index: move },
      ]);

      const { winner: _winner } = calcWinner(newBoard);
      const _isDraw = isDraw(newBoard);
      if (_winner) {
        playSound(cannonAudio);
        const newScores = { ...scores, [_winner]: scores[_winner] + 1 };
        setScores(newScores);
        handleScores(_winner, newScores);
        setWinStreaks((prev) => ({
          ...prev,
          [_winner]: prev[_winner] + 1,
          [_winner === HUMAN ? AI : HUMAN]: 0,
        }));
      } else if (_isDraw) {
        playSound(splashAudio);
        setWinStreaks({ '☠️': 0, '⚓': 0 });
      } else {
        setCurrentPlayer(HUMAN);
        resetTimer();
      }
      setAiThinking(false);
    }, 400);

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(moveTimeout);
    };
  }, [
    board,
    boardSize,
    currentPlayer,
    mode,
    difficulty,
    resolveDifficulty,
    gameOver,
    setScores,
    isGameStarted,
    resetTimer,
    scores,
    handleScores,
    cannonAudio,
    playSound,
    splashAudio,
    calcWinner,
  ]);

  const {
    watchSpeed,
    setWatchSpeed,
    watchPaused,
    setWatchPaused,
    watchDifficultyOne,
    setWatchDifficultyOne,
    watchDifficultyTwo,
    setWatchDifficultyTwo,
  } = useWatchMode({
    mode,
    isGameStarted,
    gameOver,
    board,
    currentPlayer,
    showReplayModal,
    showSeriesModal: seriesWinner !== null,
    boardSize,
    bestOfSeries,
    victoriesForAction,
    scores,
    resetGame,
    setScores,
    setBoard,
    setMoveHistory,
    setCurrentPlayer,
    setAiThinking,
    setWinStreaks,
    setBestOfSeriesScores,
  });

  useEffect(() => {
    if (!gameOver) return;
    // Tournament mode runs its own advance logic — don't flip starter here or
    // we'd race the bracket transition.
    if (mode === 'tournament') return;
    // Select to _nextGameStarter the player who did not start
    // Starter has an advantage so it is fair to change it every game. Not depending was it a win or a draw
    const _nextGameStarter = starterPlayer === HUMAN ? AI : HUMAN;
    setCurrentPlayer(_nextGameStarter);
    setStarterPlayer(_nextGameStarter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // Arrow-keys mode: when it becomes the human's turn, move focus onto the
  // board so the player can navigate with the arrow keys immediately — no
  // tabbing past the controls above the grid. Keeps the active cell if it's
  // still empty, otherwise falls back to the first empty square. Reading
  // `board`/`activeIndex` without depending on them is intentional: we only
  // want to grab focus on a turn transition, not on every board mutation.
  useEffect(() => {
    if (!isArrowKeysEnabled || !isGameStarted || !isHumanTurn || aiThinking)
      return;
    const target =
      board[activeIndex.current] === null
        ? activeIndex.current
        : board.findIndex((cell) => cell === null);
    if (target !== -1) focusCell(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArrowKeysEnabled, isGameStarted, isHumanTurn, aiThinking, focusCell]);

  function handleClick(index: number) {
    if (board[index] || gameOver || aiThinking || showForfeitMessage) return;
    if (mode === 'watch') return; // both sides are AI — grid is non-interactive
    if ((mode === 'pvc' || mode === 'tournament') && currentPlayer === AI)
      return;
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

    const { winner: _winner } = calcWinner(newBoard);
    const _isDraw = isDraw(newBoard);

    if (!_winner && !_isDraw) {
      playSound(creakAudio);
    }
    if (_winner) {
      playSound(cannonAudio);
      const newScores = { ...scores, [_winner]: scores[_winner] + 1 };
      setScores(newScores);
      handleScores(_winner, newScores);
      setWinStreaks((prev) => ({
        ...prev,
        [_winner]: prev[_winner] + 1,
        [_winner === HUMAN ? AI : HUMAN]: 0,
      }));
    } else if (_isDraw) {
      playSound(splashAudio);
      setWinStreaks({ '☠️': 0, '⚓': 0 });
    } else {
      setCurrentPlayer(
        mode === 'pvp' ? (currentPlayer === HUMAN ? AI : HUMAN) : AI,
      );
    }
  }

  function switchMode(newMode: GameMode) {
    setMode(newMode);
    setBoard(INITIAL_BOARD);
    setWatchPaused(false);
    // Watch keeps an in-session scoreboard only — resets to 0–0 on entry.
    setScores({ ...INITIAL_SCORE });
    setBestOfSeriesScores({ ...INITIAL_SCORE });
    setAiThinking(false);
    setMoveHistory([]);
    resetTimer();
    setShowForfeitMessage(false);
    setWinStreaks({ '☠️': 0, '⚓': 0 });
    setStreakBadgePlayer(null);

    if (newMode === 'tournament') {
      // Fresh bracket + random starter; AI-start kicks the move effect right away.
      const starter = beginTournament();
      setIsGameStarted(starter === AI);
    } else {
      clearTournament();
      if (newMode === 'pvc' || newMode === 'watch') {
        setStarterPlayer(HUMAN);
        setCurrentPlayer(HUMAN);
      }
      // Watch stays armed until the user picks a starter via StarterPicker.
      setIsGameStarted(false);
    }
  }

  function switchBoardSize(newSize: 3 | 5 | 10) {
    if (gameHasMoves && !gameOver) return;
    setBoardSize(newSize);
    setBoard(Array(newSize * newSize).fill(null) as BoardType);
    setScores({ ...INITIAL_SCORE });
    setBestOfSeriesScores({ ...INITIAL_SCORE });
    setAiThinking(false);
    setMoveHistory([]);
    resetTimer();
    setShowForfeitMessage(false);
    setIsGameStarted(false);
  }

  const squareSize =
    boardSize === 10 ? 'sm' : boardSize === 5 ? 'md' : undefined;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Settings cog */}
      <div>
        <Button
          variant="unstyled"
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          onClick={() => setShowSettingsModal(true)}
          className="absolute right-0 top-0 sm:right-0 sm:top-0"
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </Button>
      </div>
      {/* Multiplayer button */}
      <Button
        variant="unstyled"
        className="py-2 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 hover:bg-slate-100 hover:border-amber-500 dark:hover:bg-red-800 dark:hover:border-yellow-500 tracking-wide w-full mb-2"
        onClick={() => router.push('/multiplayer/lobby')}
      >
        Multiplayer
      </Button>

      {/* Mode selector */}
      <ModeSelector mode={mode} onSwitchMode={switchMode} />

      {/* Board size selector */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-2">
          {([3, 5, 10] as const).map((size) => (
            <button
              key={size}
              onClick={() => switchBoardSize(size)}
              disabled={gameHasMoves && !gameOver}
              aria-pressed={boardSize === size}
              className={`px-3 py-1.5 rounded-lg border-2 font-bold text-sm transition-all duration-200
                ${
                  boardSize === size
                    ? 'bg-amber-600 border-amber-800 text-white dark:bg-amber-700 dark:border-yellow-400 dark:text-yellow-300'
                    : 'bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500 hover:bg-slate-300 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400 dark:hover:border-amber-600'
                }
                ${
                  gameHasMoves && !gameOver
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                }
              `}
            >
              {size === 3 ? '3x3' : size === 5 ? '5x5' : '10x10'}
            </button>
          ))}
        </div>
        <p
          aria-live="polite"
          className="text-xs italic text-slate-600 dark:text-amber-400"
        >
          Get {boardSize === 3 ? 3 : boardSize === 5 ? 4 : 5} in a row to win
        </p>
      </div>

      {/* Difficulty selector (only in PvC mode) */}
      {mode === 'pvc' && (
        <DifficultySelector
          difficulty={difficulty}
          gameHasMoves={gameHasMoves}
          gameOver={gameOver}
          onSelect={setDifficulty}
          onReset={() => setScores({ ...INITIAL_SCORE })}
        />
      )}

      {/* Watch mode: two difficulty pickers (one per AI) + speed buttons.
          ☠️ → difficultyOne, ⚓ → difficultyTwo. Changes apply on the next
          move (the loop reads them fresh), so no mid-game lock. */}
      {mode === 'watch' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-start justify-center gap-6">
            <DifficultySelector
              label={`${playerOne.icon} ${playerOne.name}`}
              difficulty={watchDifficultyOne}
              gameHasMoves={false}
              gameOver={gameOver}
              onSelect={setWatchDifficultyOne}
              onReset={() => {}}
            />
            <DifficultySelector
              label={`${playerTwo.icon} ${playerTwo.name}`}
              difficulty={watchDifficultyTwo}
              gameHasMoves={false}
              gameOver={gameOver}
              onSelect={setWatchDifficultyTwo}
              onReset={() => {}}
            />
          </div>
          <div className="flex items-end gap-3">
            <SpeedSelector speed={watchSpeed} onSelect={setWatchSpeed} />
            <Button
              variant="unstyled"
              aria-label={
                watchPaused ? 'Resume watch mode' : 'Pause watch mode'
              }
              aria-pressed={watchPaused}
              onClick={() => setWatchPaused((p) => !p)}
              className="px-3 py-1.5 border-2 font-semibold text-lg
                bg-slate-200 border-slate-400 text-slate-700 hover:border-amber-500
                dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-500 dark:hover:border-amber-600
                mb-0.5"
            >
              {watchPaused ? '▶️' : '⏸️'}
            </Button>
          </div>
          {!isGameStarted && (
            <p className="px-3 py-1.5 rounded-md border-2 border-amber-700 bg-yellow-200 text-amber-900 dark:bg-amber-900/40 dark:border-yellow-500 dark:text-yellow-300 text-sm font-semibold tracking-wide text-center">
              Press &quot;New Voyage&quot; to start the game
            </p>
          )}
        </div>
      )}

      {/* Tournament bracket */}
      {mode === 'tournament' && tournament && (
        <TournamentBracket
          tournament={tournament}
          youIcon={playerOne.icon}
          youName={playerOne.name}
        />
      )}

      {/* Scoreboard */}
      <ScoreBoard
        myPlayer={HUMAN}
        bestOfSeriesScores={bestOfSeriesScores}
        pointSystem={pointSystem}
        scores={scores}
        mode={mode}
        bestOfSeries={mode === 'tournament' ? 'off' : bestOfSeries}
        playerTwoOverride={mode === 'tournament' ? playerTwo : undefined}
      />

      {/* Win streak badge — shown in every mode, including watch (an AI on a
          3-game tear). playerIcons resolves both sides' emoji. */}
      {streakBadgePlayer && (
        <div className="animate-bounce bg-amber-500 border-2 border-amber-700 text-white dark:bg-yellow-600 dark:border-yellow-400 dark:text-black font-bold px-4 py-2 rounded-lg text-center text-lg shadow-lg">
          {playerIcons[streakBadgePlayer]} 3 in a row! 🔥
        </div>
      )}

      {/* Pick Game Starter Player */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showStarterSelection ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <StarterPicker
          starterPlayer={starterPlayer}
          aiThinking={aiThinking}
          onSelect={(player) => {
            if (starterPlayer === player || aiThinking) return;
            setStarterPlayer(player);
            setCurrentPlayer(player);
            if ((mode === 'pvc' || mode === 'tournament') && player === AI)
              setIsGameStarted(true);
            // Watch mode is armed-but-idle until a starter is picked.
            if (mode === 'watch') setIsGameStarted(true);
          }}
        />
      </div>

      {/* Status */}
      <GameStatus
        winner={winner}
        isDraw={draw}
        currentPlayer={currentPlayer}
        mode={mode}
        aiThinking={aiThinking}
        showForfeitMessage={showForfeitMessage}
        playerTwoOverride={mode === 'tournament' ? playerTwo : undefined}
      />

      {/* Kraken mood */}

      {(mode === 'pvc' || mode === 'watch') && (
        <KrakenAvatar mood={krakenMood} />
      )}

      {/* Hourglass timer */}
      {timerEnabled && isHumanTurn && isGameStarted && (
        <HourglassTimer timeLeft={timeLeft} duration={timerDuration} />
      )}

      {/* Grid */}
      <div className="relative">
        <div
          ref={gridRef}
          role="grid"
          aria-label={`${boardSize}x${boardSize} game board${
            isArrowKeysEnabled ? ', use arrow keys to move' : ''
          }`}
          className={`grid ${
            boardSize === 10
              ? 'grid-cols-10 gap-1'
              : boardSize === 5
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
              isHint={hintIndex === i}
              isLatestMove={i === latestSquareSeized}
              disabled={
                gameOver ||
                aiThinking ||
                mode === 'watch' ||
                ((mode === 'pvc' || mode === 'tournament') &&
                  currentPlayer === AI)
              }
              tabIndex={i === activeIndex.current ? 0 : -1}
              cellRef={(el) => setRef(el, i)}
              label={`${makeCellLabel(i, boardSize)}, ${
                cell ? (cell === HUMAN ? 'skull' : 'anchor') : 'empty'
              }`}
              size={squareSize}
            />
          ))}
        </div>
        {winner && winLine && (
          <WinningLine
            winLine={winLine}
            cellSize={measurement.cellSize}
            gap={measurement.gap}
            cols={boardSize}
          />
        )}
      </div>

      {/* Tournament result modal */}
      {mode === 'tournament' && (
        <TournamentResultModal
          outcome={tournamentOutcome}
          defeatedAtFinal={defeatedAtFinal}
          onRestart={() => {
            resetMatchState();
            const starter = beginTournament();
            setIsGameStarted(starter === AI);
          }}
          onExit={() => switchMode('pvc')}
        />
      )}

      {/* Series Winner Modal — pauses the watch loop while it's open */}
      {mode !== 'tournament' && bestOfSeries !== 'off' && (
        <SeriesWinnerModal
          seriesWinner={seriesWinner}
          mode={mode}
          // pvc has a single "you" (the human) — only their series win is a
          // victory, so the Kraken winning correctly shows the loss variant.
          // pvp is a shared screen with no single "you", so whichever local
          // player wins is celebrated. watch has no "you" at all — leave
          // isWinner undefined so the modal renders its neutral variant.
          isWinner={
            mode === 'watch'
              ? undefined
              : mode === 'pvc'
              ? seriesWinner === HUMAN
              : seriesWinner !== null
          }
          onClose={() => {
            setBestOfSeriesScores({ ...INITIAL_SCORE });
            setScores({ ...INITIAL_SCORE });
            resetGame();
          }}
        />
      )}
      {/* Undo button */}
      {mode === 'pvp' && (
        <Button
          variant="unstyled"
          onClick={undoPreviousMove}
          disabled={moveHistory.length === 0 || gameOver}
          aria-label="Undo previous move"
          className="px-6 py-3 bg-slate-600 border-2 border-slate-800 text-white
      dark:bg-slate-700 dark:border-slate-500 dark:text-yellow-300
      hover:bg-slate-500 dark:hover:bg-slate-600
      hover:border-slate-600 dark:hover:border-yellow-500
      text-lg tracking-wide"
        >
          ↩️ Undo
        </Button>
      )}

      {/* Hint button */}
      {mode === 'pvc' && (
        <Button
          onClick={handleHint}
          disabled={!isHumanTurn || !isGameStarted || aiThinking}
          aria-label="Show a hint for your next move"
          className="px-6 py-3 bg-emerald-700 border-2 border-emerald-900 text-white
      dark:bg-emerald-900 dark:border-emerald-700 dark:text-yellow-300
      font-bold rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-800
      hover:border-emerald-700 dark:hover:border-yellow-500 cursor-pointer
      transition-all duration-200 text-lg tracking-wide
      disabled:opacity-40 disabled:cursor-not-allowed"
        >
          💡 Hint
        </Button>
      )}

      {/* Reset Game — hidden in tournament (matches auto-advance) */}
      {mode !== 'tournament' && (
        <Button
          variant="primary"
          onClick={resetGame}
          aria-label="Start a new game"
          className="mt-4 hover:border-red-700 dark:hover:border-yellow-500 tracking-wide"
        >
          🏴‍☠️ New Voyage
        </Button>
      )}

      {/* Replay the Game */}
      {gameOver && mode !== 'tournament' && (
        <Button
          variant="gold"
          aria-label="Replay the game"
          onClick={() => setShowReplayModal(true)}
          className="tracking-wide"
        >
          ▶ Replay game ◀
        </Button>
      )}

      {/* Replay Modal */}
      {showReplayModal && (
        <ReplayModal
          onClose={() => setShowReplayModal(false)}
          moveHistory={moveHistory}
          boardSize={boardSize}
          playerIcons={playerIcons}
        />
      )}

      {/* Sidebar */}
      <MoveHistory
        moveHistory={moveHistory}
        mode={mode}
        winner={winner}
        isDraw={draw}
        boardSize={boardSize}
        playerTwoOverride={mode === 'tournament' ? playerTwo : undefined}
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
        isArrowKeysEnabled={isArrowKeysEnabled}
        setIsArrowKeysEnabled={setIsArrowKeysEnabled}
        bestOfSeries={bestOfSeries}
        setBestOfSeries={setBestOfSeries}
        setScores={setScores}
        setBestOfSeriesScores={setBestOfSeriesScores}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
        resetGame={resetGame}
        victoriesForAction={victoriesForAction}
        setVictoriesForAction={setVictoriesForAction}
        showPlayerSettings={true}
        mode={mode}
        winLossDraw={winLossDraw}
        onResetStats={() => setWinLossDraw(INITIAL_WIN_LOSS_DRAW)}
      />
    </div>
  );
}
