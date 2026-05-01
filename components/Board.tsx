// components/Board.tsx

'use client';
import { useCallback, useEffect, useState } from 'react';
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
import WinningLine from './WinningLine';
import { useGridMeasure } from '@/hooks/useGridMeasure';
import { BestOfSeriesNames, CELL_LABELS, MoveEntry } from '@/utils/types';
import MoveHistory from './MoveHistory';
import { useTimer } from '@/hooks/useTimer';
import HourglassTimer from './HourglassTimer';
import KrakenAvatar from './KrakenAvatar';
import { getKrakenMood } from '@/utils/krakenMood';
import { SettingsModal } from './SettingsModal';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import SeriesWinnerModal from './SeriesWinnerModal';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameSettings } from '@/hooks/useGameSettings';
import StarterPicker from './StarterPicker';
import ModeSelector from './ModeSelector';
import ScoreBoard from './ScoreBoard';
import DifficultySelector from './DifficultySelector';
import ReplayModal from './ReplayModal';
import { getStormLevel } from '@/utils/stormLevel';
import { useRouter } from 'next/navigation';

type BoardProps = {
  scores: Record<Player, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
  bestOfSeriesScores: Record<Player, number>;
  setBestOfSeriesScores: React.Dispatch<
    React.SetStateAction<Record<Player, number>>
  >;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
  onStormLevelChange: (level: number) => void;
};

const INITIAL_BOARD: BoardType = Array(9).fill(null);

export default function Board({
  scores,
  setScores,
  bestOfSeriesScores,
  setBestOfSeriesScores,
  isDarkTheme,
  setIsDarkTheme,
  onStormLevelChange,
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
  const [showReplayModal, setShowReplayModal] = useState(false);

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
  } = useGameSettings();

  const { winner, line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

  const { setRef, handleKeyDown, activeIndex, resetFocus, focusCell } =
    useGridNavigation(3);

  const { cannonAudio, creakAudio, playSound, splashAudio } = useGameAudio(
    volume,
    isAudioMuted,
  );

  const stormLevel = getStormLevel({ board, winner, isDraw: draw, mode });

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

  const TIMER_DURATION = 10;

  const gameHasMoves = board.some((cell) => cell !== null);
  const isHumanTurn = !gameOver && (mode === 'pvp' || currentPlayer === HUMAN);

  const SERIES_WINS_NEEDED = BestOfSeriesNames[bestOfSeries];
  const seriesWinner =
    bestOfSeries === 'off'
      ? null
      : bestOfSeriesScores[HUMAN] >= SERIES_WINS_NEEDED
      ? HUMAN
      : bestOfSeriesScores[AI] >= SERIES_WINS_NEEDED
      ? AI
      : null;

  // Measurement logic
  const { gridRef, measurement } = useGridMeasure(3);

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

  const { onTouchStart, onTouchEnd } = useSwipeNavigation(gridRef, handleSwipe);

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

  // moved upwards due to this error: Error: Cannot access variable before it is declared
  const handleScores = useCallback(
    (winner: Player, currentScores: Record<Player, number>) => {
      if (
        bestOfSeries === 'off' &&
        pointSystem === 'treasureChest' &&
        currentScores[winner] >= 6
      ) {
        setScores({ ...INITIAL_SCORE });
        resetGame();
      }

      if (bestOfSeries !== 'off' && currentScores[winner] >= 5) {
        setBestOfSeriesScores((prev) => ({
          ...prev,
          [winner]: prev[winner] + 1,
        }));
        setScores({ ...INITIAL_SCORE });
      }
    },
    [setScores, resetGame, setBestOfSeriesScores, bestOfSeries, pointSystem],
  );

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
        const newScores = { ...scores, [_winner]: scores[_winner] + 1 };
        setScores(newScores);
        handleScores(_winner, newScores);
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
    scores,
    handleScores,
    cannonAudio,
    playSound,
    splashAudio,
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
      const newScores = { ...scores, [_winner]: scores[_winner] + 1 };
      setScores(newScores);
      handleScores(_winner, newScores);
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Multiplayer button */}
      <button
        className="py-2 bg-white border-2 border-slate-300 text-slate-800 dark:bg-red-900 dark:border-red-700 dark:text-yellow-300 font-bold rounded-lg hover:bg-slate-100 hover:border-amber-500 dark:hover:bg-red-800 dark:hover:border-yellow-500 cursor-pointer transition-all duration-200 tracking-wide w-full mb-2"
        onClick={() => router.push('/multiplayer/lobby')}
      >
        Multiplayer
      </button>

      {/* Mode selector */}
      <ModeSelector
        mode={mode}
        gameHasMoves={gameHasMoves}
        gameOver={gameOver}
        showSettingsModal={showSettingsModal}
        onSwitchMode={switchMode}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

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

      {/* Scoreboard */}
      <ScoreBoard
        bestOfSeriesScores={bestOfSeriesScores}
        pointSystem={pointSystem}
        scores={scores}
        mode={mode}
        bestOfSeries={bestOfSeries}
      />

      {/* Pick Game Starter Player */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showStarterSelection ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <StarterPicker
          starterPlayer={starterPlayer}
          aiThinking={aiThinking}
          mode={mode}
          onSelect={(player) => {
            if (starterPlayer === player || aiThinking) return;
            setStarterPlayer(player);
            setCurrentPlayer(player);
            if (mode === 'pvc' && player === AI) setIsGameStarted(true);
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

      {/* Series Winner Modal */}
      {bestOfSeries !== 'off' && (
        <SeriesWinnerModal
          seriesWinner={seriesWinner}
          mode={mode}
          isDarkTheme={isDarkTheme}
          onClose={() => {
            setBestOfSeriesScores({ ...INITIAL_SCORE });
            setScores({ ...INITIAL_SCORE });
            resetGame();
          }}
        />
      )}

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

      {/* Replay the Game */}
      {gameOver && (
        <button
          aria-label="Replay the game"
          onClick={() => setShowReplayModal(true)}
          className="px-6 py-3 bg-amber-600 border-2 border-amber-800 text-white
      dark:bg-amber-700 dark:border-yellow-500 dark:text-yellow-300
      font-bold rounded-lg hover:bg-amber-500 dark:hover:bg-amber-600
      cursor-pointer transition-all duration-200 text-lg tracking-wide"
        >
          ▶ Replay game ◀
        </button>
      )}

      {/* Replay Modal */}

      {showReplayModal && (
        <ReplayModal
          isDarkTheme={isDarkTheme}
          onClose={() => setShowReplayModal(false)}
          moveHistory={moveHistory}
        />
      )}

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
        bestOfSeries={bestOfSeries}
        setBestOfSeries={setBestOfSeries}
        setScores={setScores}
        setBestOfSeriesScores={setBestOfSeriesScores}
        resetGame={resetGame}
      />
    </div>
  );
}
