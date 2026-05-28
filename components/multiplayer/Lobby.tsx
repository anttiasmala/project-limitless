// components/multiplayer/Lobby.tsx

'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Button from '../utils/Button';
import { SettingsModal } from '@/components/SettingsModal';
import { useGameSettings } from '@/hooks/multiplayer/useGameSettings';
import { useGameAudio } from '@/hooks/useGameAudio';
import SvgSettings from '@/icons/settings';
import type { LobbyEntry } from '@/utils/multiplayer/multiplayerTypes';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { useKeyPress } from '@/hooks/useKeyPress';
import CreateRoomModal from './CreateRoomModal';

export default function Lobby() {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<LobbyEntry[]>([]);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGameLobbySettings, setShowGameLobbySettings] = useState(false);
  const [joinId, setJoinId] = useState('');

  const {
    setIsArrowKeysEnabled,
    isArrowKeysEnabled,
    setIsAudioMuted,
    isAudioMuted,
    setVolume,
    volume,
  } = useGameSettings();
  const { cannonAudio, creakAudio, splashAudio } = useGameAudio(
    volume,
    isAudioMuted,
  );

  const openLobbyCount = lobbies.filter((l) => l.connectedCount === 1).length;

  function joinRoom() {
    if (joinId.trim()) router.push(`/multiplayer/${joinId.trim()}`);
  }

  const fetchLobbies = useCallback(async () => {
    try {
      const res = await fetch('/api/lobbies', { method: 'GET' });
      if (!res.ok) return;
      const data = (await res.json()) as LobbyEntry[];
      if (Array.isArray(data)) {
        setLobbies(data);
      }
    } catch {
      // network/parse error — keep the previously fetched lobbies
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLobbies();

    const interval = setInterval(fetchLobbies, 5000);

    return () => clearInterval(interval);
  }, [fetchLobbies]);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold dark:text-yellow-300">
        ⚓ Multiplayer
      </h1>
      {/* Exit button */}
      <div className="relative flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-slate-800 dark:text-amber-700 px-0 py-0 text-base"
        >
          ✕ Back to main page
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
      {/* Lobby list and create Lobby buttons*/}
      <Button onClick={() => setIsLobbyModalOpen(true)}>
        Lobby list: {openLobbyCount} games
      </Button>
      <Button onClick={() => setShowGameLobbySettings(true)}>
        🏴‍☠️ Create New Room
      </Button>

      <div className="flex gap-2">
        <input
          value={joinId}
          aria-label="Room code"
          onChange={(e) => setJoinId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          placeholder="Enter room code..."
          className="w-48 sm:w-auto px-2 sm:px-4 py-2 rounded-lg border-2 border-slate-400 bg-amber-400 text-black
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
      />

      {isLobbyModalOpen && (
        <LobbyModal
          closeModal={() => setIsLobbyModalOpen(false)}
          lobbies={lobbies}
          fetchLobbies={fetchLobbies}
        />
      )}

      {showGameLobbySettings && (
        <CreateRoomModal onClose={() => setShowGameLobbySettings(false)} />
      )}
    </div>
  );
}

function LobbyModal({
  closeModal,
  lobbies,
  fetchLobbies,
}: {
  closeModal: () => void;
  lobbies: LobbyEntry[];
  fetchLobbies: () => Promise<void>;
}) {
  const [activeMode, setActiveMode] = useState<'openLobby' | 'spectator'>(
    'openLobby',
  );
  const [isRefetching, setIsRefetching] = useState(false);

  async function handleRefetch() {
    if (isRefetching) return;
    setIsRefetching(true);
    try {
      await fetchLobbies();
    } finally {
      setIsRefetching(false);
    }
  }

  useKeyPress('Escape', closeModal, true);

  usePreventBackgroundScrolling(true);

  return createPortal(
    <div>
      {/* Backdrop */}
      <div className="fixed inset-0 z-98 bg-black/80" onClick={closeModal} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lobby list"
        className="fixed top-1/2 left-1/2 z-99 -translate-x-1/2 -translate-y-1/2
          w-[92vw] max-w-md
          bg-amber-50 dark:bg-amber-950
          border-2 border-amber-800 dark:border-amber-700
          rounded-xl shadow-2xl
          p-5 sm:p-6 pt-12 sm:pt-12 flex flex-col gap-4 max-h-[90vh]"
      >
        {/* Close button — absolute top-right with a proper touch target */}
        <Button
          variant="unstyled"
          onClick={closeModal}
          aria-label="Close modal"
          className="absolute top-2 right-2 w-10 h-10 rounded-full text-lg leading-none
            text-slate-600 dark:text-amber-300
            hover:bg-amber-200 dark:hover:bg-amber-900
            hover:text-red-600 dark:hover:text-red-400
            focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          ✕
        </Button>

        {/* Title */}
        <h2 className="absolute top-3 left-5 sm:left-6 text-lg font-black text-amber-700 dark:text-yellow-400 tracking-wide shrink-0">
          🏴‍☠️ Game Lobbies
        </h2>

        {/* Tabs + refetch */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="tablist"
            className="flex flex-1 rounded-lg border-2 border-amber-800 dark:border-amber-700 overflow-hidden bg-amber-100 dark:bg-amber-900/40"
          >
            <Button
              role="tab"
              aria-selected={activeMode === 'openLobby'}
              variant="unstyled"
              className={`flex-1 py-2 px-2 text-sm sm:text-base font-bold rounded-none border-0 transition-colors ${
                activeMode === 'openLobby'
                  ? 'bg-amber-600 text-white dark:bg-amber-700 dark:text-yellow-300'
                  : 'text-slate-700 dark:text-yellow-300/70 hover:bg-amber-200 dark:hover:bg-amber-900'
              }`}
              onClick={() => setActiveMode('openLobby')}
            >
              🏴‍☠️ Open
            </Button>
            <Button
              role="tab"
              aria-selected={activeMode === 'spectator'}
              variant="unstyled"
              className={`flex-1 py-2 px-2 text-sm sm:text-base font-bold rounded-none border-0 transition-colors ${
                activeMode === 'spectator'
                  ? 'bg-amber-600 text-white dark:bg-amber-700 dark:text-yellow-300'
                  : 'text-slate-700 dark:text-yellow-300/70 hover:bg-amber-200 dark:hover:bg-amber-900'
              }`}
              onClick={() => setActiveMode('spectator')}
            >
              👁️ Spectator
            </Button>
          </div>

          <Button
            variant="unstyled"
            aria-label="Refetch lobbies"
            title="Refetch lobbies"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="w-10 h-10 shrink-0 rounded-lg border-2 border-amber-800 dark:border-amber-700
              bg-amber-100 dark:bg-amber-900/40 text-base
              hover:bg-amber-200 dark:hover:bg-amber-900
              focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <span className={isRefetching ? 'inline-block animate-spin' : ''}>
              🔄
            </span>
          </Button>
        </div>

        {/* Table for open lobbies */}
        <div className="overflow-y-auto min-h-0">
          <LobbyTable
            activeMode={activeMode}
            lobbies={
              activeMode === 'openLobby'
                ? lobbies.filter((l) => l.connectedCount === 1)
                : lobbies.filter((l) => l.allowSpectators)
            }
            closeModal={closeModal}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function LobbyTable({
  lobbies,
  activeMode,
  closeModal,
}: {
  lobbies: LobbyEntry[];
  activeMode: 'spectator' | 'openLobby';
  closeModal: () => void;
}) {
  const router = useRouter();
  if (lobbies.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl" aria-hidden>
          {activeMode === 'openLobby' ? '🏝️' : '👁️'}
        </span>
        <p className="text-slate-500 dark:text-amber-600 font-semibold">
          {activeMode === 'openLobby'
            ? 'No open lobbies'
            : 'No active games to spectate'}
        </p>
        <p className="text-xs text-slate-400 dark:text-amber-700">
          {activeMode === 'openLobby'
            ? 'Be the first to create one!'
            : 'Check back in a moment.'}
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-amber-300 dark:border-amber-800 text-slate-500 dark:text-amber-600 text-left sticky top-0 bg-amber-50 dark:bg-amber-950">
          <th className="pb-2 font-semibold text-xs uppercase tracking-wider">
            Room
          </th>
          <th className="pb-2 font-semibold text-xs uppercase tracking-wider pr-2 sm:pr-0">
            Players
          </th>
          <th className="pb-2 font-semibold text-xs uppercase tracking-wider">
            Status
          </th>
          <th className="pb-2" />
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-200 dark:divide-amber-900">
        {lobbies.map((lobby) => (
          <tr
            key={lobby.roomId}
            className="text-slate-800 dark:text-yellow-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            <td className="py-3 font-mono text-xs sm:px-0 px-1">
              {lobby.roomId}
            </td>
            <td className="py-3 font-semibold">{lobby.connectedCount} / 2</td>
            <td className="py-3">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
                        ${
                          lobby.status === 'waiting'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : lobby.status === 'playing'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                        }`}
              >
                {lobby.status === 'waiting'
                  ? '⚓ Waiting'
                  : lobby.status === 'playing'
                  ? '⚔️ Playing'
                  : '⚓ Finished'}
              </span>
            </td>
            <td className="py-3 text-right">
              <Button
                onClick={() => {
                  router.push(
                    `/multiplayer/${lobby.roomId}${
                      activeMode === 'spectator' ? '?spectator=true' : ''
                    }`,
                  );
                  closeModal();
                }}
                className="px-3 py-1.5 text-xs"
              >
                Join
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
