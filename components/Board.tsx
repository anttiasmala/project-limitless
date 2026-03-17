'use client';
import React, { useEffect, useState } from 'react';
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
} from '@/lib/gameLogic';

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

  const { winner, line: winLine } = calculateWinner(board);
  const draw = !winner && isDraw(board);
  const gameOver = !!winner || draw;

  // AI move logic

  useEffect(() => {
    if (mode !== 'pvc' || gameOver || currentPlayer !== AI) return;

    setAiThinking(true);
    const timeout = setTimeout(() => {
      const move = getAIMove(board, AI, HUMAN, difficulty);
      const newBoard = [...board];
      newBoard[move] = AI;
      setBoard(newBoard);

      const { winner: _winner } = calculateWinner(newBoard);
      if (_winner) {
        setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
      } else if (!isDraw(newBoard)) {
        setCurrentPlayer(HUMAN);
      }
      setAiThinking(false);
    }, 400); // slight delay so it feels alive

    return () => clearTimeout(timeout);
  }, [board, currentPlayer, mode, difficulty, gameOver]);

  function handleClick(index: number) {
    if (board[index] || gameOver || aiThinking) return;
    if (mode === 'pvc' && currentPlayer === AI) return;
    setIsGameStarted(true);

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner: _winner } = calculateWinner(newBoard);
    if (_winner) {
      setScores((prev) => ({ ...prev, [_winner]: prev[_winner] + 1 }));
    } else if (!isDraw(newBoard)) {
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
    setScores({ '☠️': 0, '⚓': 0 });
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
                  ${isGameStarted && difficulty !== _difficulty ? 'cursor-not-allowed' : 'cursor-pointer'}    
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
    </div>
  );
}
