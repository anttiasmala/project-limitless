// components/multiplayer/Lobby.tsx

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function Lobby() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');

  function createRoom() {
    const id = nanoid(8);
    router.push(`/multiplayer/${id}`);
  }

  function joinRoom() {
    if (joinId.trim()) router.push(`/multiplayer/${joinId.trim()}`);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold dark:text-yellow-300">
        ⚓ Multiplayer
      </h1>
      {/* Exit button */}
      <button
        onClick={() => router.push('/')}
        className="text-md text-slate-800 hover:text-red-500 dark:text-amber-700
      dark:hover:text-red-400 cursor-pointer transition-colors"
      >
        ✕ Back to main page
      </button>
      <button
        onClick={createRoom}
        className="px-6 py-3 bg-red-700 border-2 border-red-900 text-white
          dark:bg-red-900 dark:border-red-700 dark:text-yellow-300
          font-bold rounded-lg hover:bg-red-600 cursor-pointer
          transition-all duration-200 text-lg"
      >
        🏴‍☠️ Create New Room
      </button>

      <div className="flex gap-2">
        <input
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          placeholder="Enter room code..."
          className="px-4 py-2 rounded-lg border-2 border-slate-400 bg-amber-400 text-black
            dark:border-amber-800 dark:bg-amber-950/40 dark:text-yellow-300
            focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={joinRoom}
          className="px-4 py-2 bg-amber-600 border-2 border-amber-800 text-white
            dark:bg-amber-700 dark:border-yellow-500 dark:text-yellow-300
            font-bold rounded-lg hover:bg-amber-500 cursor-pointer
            transition-all duration-200"
        >
          Join
        </button>
      </div>
    </div>
  );
}
