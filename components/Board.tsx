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
import { MoveEntry } from '@/utils/types';
import MoveHistory from './MoveHistory';
import { useTimer } from '@/hooks/useTimer';
import HourglassTimer from './HourglassTimer';
import KrakenAvatar from './KrakenAvatar';
import { getKrakenMood } from '@/utils/krakenMood';
import { SettingsModal } from './SettingsModal';

type BoardProps = {
  scores: Record<Player, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
};

const INITIAL_BOARD: BoardType = Array(9).fill(null);

export default function Board({ scores, setScores }: BoardProps) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState<BoardType>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('☠️');
  const [starterPlayer, setStarterPlayer] = useState<Player>('☠️');

  const [mode, setMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);

  const [moveHistory, setMoveHistory] = useState<MoveEntry[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showForfeitMessage, setShowForfeitMessage] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const { winner, line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

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

  const ALL_AUDIOS = [cannonAudio, splashAudio, creakAudio];
  const TIMER_DURATION = 10;

  const gameHasMoves = board.some((cell) => cell !== null);
  const isHumanTurn = !gameOver && (mode === 'pvp' || currentPlayer === HUMAN);

  // Measurement logic
  const { gridRef, measurement } = useGridMeasure(3);

  // Audio and Hourglass logic
  useEffect(() => {
    const savedVolume = parseFloat(localStorage.getItem('volume') ?? '0.5');
    const savedMuted = localStorage.getItem('muted') === 'true';
    const savedTimerEnabled = localStorage.getItem('timerEnabled') === 'true';

    cannonAudio.current = new Audio('/sounds/cannon.mp3');
    splashAudio.current = new Audio('/sounds/splash.mp3');
    creakAudio.current = new Audio('/sounds/creak.mp3');

    [cannonAudio, splashAudio, creakAudio].forEach((ref) => {
      if (ref.current) {
        ref.current.volume = savedVolume;
        ref.current.muted = savedMuted;
      }
    });

    setTimeout(() => {
      setVolume(savedVolume);
      setIsAudioMuted(savedMuted);
      setTimerEnabled(savedTimerEnabled);
    }, 0);
  }, []);

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
    setShowForfeitMessage(false);
  }, [starterPlayer, mode, resetTimer]);

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

  const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: '🌊 Calm Seas (Easy)',
    medium: '⛈️ Stormy Waters (Medium)',
    hard: "💀 Davy Jones' Wrath (Hard)",
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      <div className="flex gap-3">
        {(['pvp', 'pvc'] as const).map((_mode) => (
          <button
            key={_mode}
            onClick={() => switchMode(_mode)}
            className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all duration-200
              ${
                mode === _mode
                  ? 'bg-amber-700 border-yellow-400 text-yellow-300'
                  : 'bg-amber-950/50 border-amber-800 text-amber-400 hover:border-amber-600'
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
            className="absolute -left-1.5 sm:left-3 top-0 cursor-pointer"
            onClick={() => setShowSettingsModal(true)}
          >
            <SvgSettings className="w-8 h-8 fill-none" />
          </button>
        </div>
      </div>

      {/* Difficulty selector (only in PvC mode) */}
      {mode === 'pvc' && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-amber-500 text-xs uppercase tracking-widest">
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
                      ? 'bg-red-900 border-red-500 text-yellow-300'
                      : 'bg-amber-950/40 border-amber-800 text-amber-500 hover:border-amber-600'
                  }
                  ${
                    gameHasMoves && difficulty !== _difficulty && !gameOver
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }    
                  `}
              >
                {DIFFICULTY_LABELS[_difficulty]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div className="flex gap-8 text-amber-200 text-lg font-semibold bg-amber-950/50 border border-amber-800 rounded-xl px-8 py-3">
        <span>
          ☠️ {mode === 'pvc' ? 'You' : 'Davy Jones'}: {scores[HUMAN]}
        </span>
        <span className="text-amber-600">|</span>
        <span>
          ⚓ {mode === 'pvc' ? 'Kraken' : 'Capt. Hook'}: {scores[AI]}
        </span>
      </div>

      {/* Game Starter */}
      {(!isGameStarted || gameOver) && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-amber-500 text-xs uppercase tracking-widest">
            Who sails first?
          </span>
          <div className="relative flex bg-amber-950/60 border border-amber-800 rounded-full p-1 gap-1">
            {/* Sliding pill background */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full
          bg-amber-700 border border-yellow-500 shadow-inner
          transition-transform duration-300 ease-in-out"
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
                ? 'text-yellow-300'
                : 'text-amber-500 hover:text-amber-300'
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
        <div ref={gridRef} className="grid grid-cols-3 gap-3">
          {board.map((cell, i) => (
            <Square
              key={i}
              value={cell}
              onClick={() => handleClick(i)}
              isWinning={winLine?.includes(i) ?? false}
              disabled={
                gameOver ||
                aiThinking ||
                (mode === 'pvc' && currentPlayer === AI)
              }
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
        className="mt-4 px-6 py-3 bg-red-900 border-2 border-red-700 text-yellow-300
          font-bold rounded-lg hover:bg-red-800 hover:border-yellow-500 hover:cursor-pointer 
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
        AudioArray={ALL_AUDIOS}
        timerEnabled={timerEnabled}
        setTimerEnabled={setTimerEnabled}
      />
    </div>
  );
}
