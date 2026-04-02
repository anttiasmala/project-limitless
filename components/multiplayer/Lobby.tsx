// components/multiplayer/Lobby.tsx

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { createPortal } from 'react-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from '../utils/Button';

type LobbyEntry = {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  connectedCount: number;
};

export default function Lobby() {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<LobbyEntry[]>([]);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);
  const [joinId, setJoinId] = useState('');

  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);

  function createRoom() {
    const id = nanoid(8);
    router.push(`/multiplayer/${id}`);
  }

  function joinRoom() {
    if (joinId.trim()) router.push(`/multiplayer/${joinId.trim()}`);
  }
  useEffect(() => {
    const fetchLobbies = async () => {
      const res = await fetch('/api', { method: 'GET' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLobbies(data);
      }
    };
    // this is here to get the lobbies immediately when user connects to Lobby
    fetchLobbies();

    const interval = setInterval(fetchLobbies, 5000);

    return () => clearInterval(interval);
  }, []);

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
      <Button onClick={() => setIsLobbyModalOpen(true)}>
        Lobby list
        {lobbies?.length && lobbies.length > 0
          ? `: ${lobbies.length} games`
          : ''}
      </Button>
      <Button onClick={createRoom}>🏴‍☠️ Create New Room</Button>

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
        <Button
          onClick={joinRoom}
          className="px-4 py-2 bg-amber-600 border-2 border-amber-800 text-white
            dark:bg-amber-700 dark:border-yellow-500 dark:text-yellow-300
            font-bold rounded-lg hover:bg-amber-500 cursor-pointer
            transition-all duration-200"
        >
          Join
        </Button>
      </div>
      {isLobbyModalOpen && (
        <LobbyModal
          isDarkTheme={isDarkTheme}
          closeModal={() => setIsLobbyModalOpen(false)}
          lobbies={lobbies ?? []}
        />
      )}
    </div>
  );
}

function LobbyModal({
  isDarkTheme,
  closeModal,
  lobbies,
}: {
  isDarkTheme: boolean;
  closeModal: () => void;
  lobbies: LobbyEntry[];
}) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeModal]);

  return createPortal(
    <div className={isDarkTheme ? 'dark' : ''}>
      {/* Backdrop */}
      <div className="fixed inset-0 z-98 bg-black/80" onClick={closeModal} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lobby list"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2
          w-[90vw] max-w-md
          bg-amber-50 dark:bg-amber-950
          border-2 border-amber-800 dark:border-amber-700
          rounded-xl shadow-2xl
          p-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-yellow-300">
            🏴‍☠️ Open Lobbies
          </h2>
          <button
            onClick={closeModal}
            className="text-slate-500 hover:text-red-500 dark:text-amber-600
              dark:hover:text-red-400 transition-colors cursor-pointer text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        {lobbies.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-amber-700 py-6">
            No open lobbies. Be the first to create one!
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-amber-300 dark:border-amber-800
                text-slate-500 dark:text-amber-600 text-left"
              >
                <th className="pb-2 font-semibold">Room</th>
                <th className="pb-2 font-semibold">Players</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200 dark:divide-amber-900">
              {lobbies.map((lobby) => (
                <tr
                  key={lobby.roomId}
                  className="text-slate-800 dark:text-yellow-200"
                >
                  <td className="py-3 font-mono text-xs">{lobby.roomId}</td>
                  <td className="py-3">{lobby.connectedCount} / 2</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        lobby.status === 'waiting'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}
                    >
                      {lobby.status === 'waiting' ? '⚓ Waiting' : '⚔️ Playing'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {lobby.status === 'waiting' && (
                      <Button
                        onClick={() => {
                          router.push(`/multiplayer/${lobby.roomId}`);
                          closeModal();
                        }}
                        className="px-3 py-1 text-xs"
                      >
                        Join
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>,
    document.body,
  );
}
