'use client';
import React, { useEffect, useRef, useState } from 'react';
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
import { createPortal } from 'react-dom';

type BoardProps = {
  scores: Record<Player, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<Player, number>>>;
};

const INITIAL_BOARD: BoardType = Array(9).fill(null);

export default function Board({ scores, setScores }: BoardProps) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState<BoardType>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('☠️');

  const [mode, setMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const { winner, line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

  const cannonAudio = useRef<HTMLAudioElement | null>(null);
  const splashAudio = useRef<HTMLAudioElement | null>(null);
  const creakAudio = useRef<HTMLAudioElement | null>(null);

  const ALL_AUDIOS = [cannonAudio, splashAudio, creakAudio];
  // Audio logic

  useEffect(() => {
    cannonAudio.current = new Audio('/sounds/cannon.mp3');
    splashAudio.current = new Audio('/sounds/splash.mp3');
    creakAudio.current = new Audio('/sounds/creak.mp3');
  }, []);

  function playSound(ref: React.RefObject<HTMLAudioElement | null>) {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
    }
  }

  // AI move logic

  useEffect(() => {
    if (mode !== 'pvc' || gameOver || currentPlayer !== AI) return;
    // this thinkingTimeout added to prevent ESLint error, but having the aiThinking to be set immediately
    const thinkingTimeout = setTimeout(() => setAiThinking(true), 0);

    const moveTimeout = setTimeout(() => {
      const move = getAIMove(board, AI, HUMAN, difficulty);
      const newBoard = [...board];
      newBoard[move] = AI;
      setBoard(newBoard);

      const { winner: _winner } = calculateWinner(newBoard);
      const _isDraw = isDraw(newBoard);
      if (_winner) {
        playSound(cannonAudio);
        setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
      } else if (_isDraw) {
        playSound(splashAudio);
      } else {
        setCurrentPlayer(HUMAN);
      }
      setAiThinking(false);
    }, 400); // slight delay so it feels alive

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(moveTimeout);
    };
  }, [board, currentPlayer, mode, difficulty, gameOver, setScores]);

  function handleClick(index: number) {
    if (board[index] || gameOver || aiThinking) return;
    if (mode === 'pvc' && currentPlayer === AI) return;
    setIsGameStarted(true);

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

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

  function resetGame() {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(HUMAN);
    setAiThinking(false);
    setIsGameStarted(false);
  }

  function switchMode(newMode: 'pvp' | 'pvc') {
    setMode(newMode);
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(HUMAN);
    setScores({ ...INITIAL_SCORE });
    setAiThinking(false);
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
                  : 'bg-amber-950/50 border-amber-800 text-amber-400 hover:border-amber-600 hover:cursor-pointer'
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
                  if (isGameStarted) return;
                  setDifficulty(_difficulty);
                  resetGame();
                }}
                className={`px-3 py-1.5 rounded-lg border-2 font-semibold text-xs transition-all duration-200
                  ${
                    difficulty === _difficulty
                      ? 'bg-red-900 border-red-500 text-yellow-300'
                      : 'bg-amber-950/40 border-amber-800 text-amber-500 hover:border-amber-600'
                  }
                  ${
                    isGameStarted && difficulty !== _difficulty
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

      {/* Status */}
      <GameStatus
        winner={winner}
        isDraw={draw}
        currentPlayer={currentPlayer}
        mode={mode}
        aiThinking={aiThinking}
      />

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
          <Square
            key={i}
            value={cell}
            onClick={() => handleClick(i)}
            isWinning={winLine?.includes(i) ?? false}
            disabled={
              gameOver || aiThinking || (mode === 'pvc' && currentPlayer === AI)
            }
          />
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={resetGame}
        className="mt-4 px-6 py-3 bg-red-900 border-2 border-red-700 text-yellow-300
          font-bold rounded-lg hover:bg-red-800 hover:border-yellow-500 hover:cursor-pointer 
          transition-all duration-200 text-lg tracking-wide"
      >
        🏴‍☠️ New Voyage
      </button>

      {/* Settings Modal */}
      <div>
        <SettingsModal
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          volume={volume}
          setVolume={setVolume}
          AudioArray={ALL_AUDIOS}
        />
      </div>
    </div>
  );
}

function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  isAudioMuted,
  setIsAudioMuted,
  volume,
  setVolume,
  AudioArray,
}: {
  showSettingsModal: boolean;
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
  AudioArray: React.RefObject<HTMLAudioElement | null>[];
  isAudioMuted: boolean;
  setIsAudioMuted: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (!showSettingsModal) return null;
  return createPortal(
    <>
      <div
        className="fixed top-0 left-0 z-98 h-full w-full bg-black opacity-80"
        onClick={() => setShowSettingsModal(false)}
      />
      <div className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2">
        <button
          className="border rounded-md mb-2 cursor-pointer"
          onClick={() => setShowSettingsModal(false)}
        >
          Close Window
        </button>
        <div
          className="w-48 h-auto min-h-48 bg-red-900 border-2 border-red-700 text-yellow-300
          font-bold rounded-lg hover:bg-red-800 hover:border-yellow-500"
        >
          <div className="mt-3 ml-3 flex flex-col">
            <div
              className="flex
            "
            >
              <label className="cursor-pointer select-none">
                Mute sounds
                <input
                  type="checkbox"
                  className="ml-2 w-5 h-5 cursor-pointer align-middle"
                  checked={isAudioMuted}
                  onChange={(e) => {
                    const muted = e.target.checked;
                    setIsAudioMuted(muted);
                    if (!muted && volume === 0) {
                      setVolume(0.5);
                      AudioArray.forEach((ref) => {
                        if (ref.current) ref.current.volume = 0.5;
                      });
                    }
                    AudioArray.forEach((ref) => {
                      if (ref.current) ref.current.muted = muted;
                    });
                  }}
                />
              </label>
            </div>
            <div className="mt-3 flex">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                className="cursor-pointer w-max accent-yellow-400"
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  const muted = vol === 0;
                  setIsAudioMuted(muted);
                  AudioArray.forEach((ref) => {
                    if (ref.current) {
                      ref.current.volume = vol;
                      ref.current.muted = muted;
                    }
                  });
                }}
              />
              <p className="ml-3">{Math.floor(volume * 100)}</p>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
