// components/multiplayer/Lobby.tsx

'use client';
import { useEffect, useState } from 'react';
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
  useEffect(() => {
    const fetchLobbies = async () => {
      const res = await fetch('/api', { method: 'GET' });
      const data = (await res.json()) as LobbyEntry[];
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
      <div className="relative flex items-center gap-6">
        <button
          onClick={() => router.push('/')}
          className="text-slate-800 hover:text-red-500 dark:text-amber-700 dark:hover:text-red-400 cursor-pointer transition-colors"
        >
          ✕ Back to main page
        </button>
        <button
          aria-label="Open settings"
          aria-expanded={showSettingsModal}
          className="relative cursor-pointer"
          onClick={() => setShowSettingsModal(true)}
        >
          <SvgSettings className="w-8 h-8 fill-none dark:text-white text-amber-700" />
        </button>
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
          lobbies={lobbies ?? []}
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
}: {
  closeModal: () => void;
  lobbies: LobbyEntry[];
}) {
  const [activeMode, setActiveMode] = useState<'openLobby' | 'spectator'>(
    'openLobby',
  );

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
          w-[90vw] max-w-md
          bg-amber-50 dark:bg-amber-950
          border-2 border-amber-800 dark:border-amber-700
          rounded-xl shadow-2xl
          p-6 flex flex-col gap-4 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <button
            className={`text-xl font-bold text-slate-800 dark:text-yellow-300 cursor-pointer border-2 rounded-md ${
              activeMode === 'openLobby'
                ? 'bg-red-500 text-white dark:bg-red-500'
                : ''
            }`}
            onClick={() => setActiveMode('openLobby')}
          >
            🏴‍☠️ Open Lobbies
          </button>
          <button
            className={`text-xl font-bold text-slate-800 dark:text-yellow-300 cursor-pointer border-2 rounded-md ${
              activeMode === 'spectator'
                ? 'bg-red-500 text-white dark:bg-red-500'
                : ''
            }`}
            onClick={() => setActiveMode('spectator')}
          >
            👁️ Spectator
          </button>
          <button
            onClick={closeModal}
            className="text-slate-500 hover:text-red-500 dark:text-amber-600
              dark:hover:text-red-400 transition-colors cursor-pointer text-lg ml-2"
            aria-label="Close modal"
          >
            ✕
          </button>
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
      <p className="text-center text-slate-500 dark:text-amber-700 py-6">
        {activeMode === 'openLobby'
          ? 'No open lobbies. Be the first to create one!'
          : 'No active games to spectate.'}
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-amber-300 dark:border-amber-800 text-slate-500 dark:text-amber-600 text-left sticky top-0 bg-amber-50 dark:bg-amber-950">
          <th className="pb-2 font-semibold">Room</th>
          <th className="pb-2 font-semibold pr-2 sm:pr-0">Players</th>
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
            <td className="py-3 font-mono text-xs sm:px-0 px-1">
              {lobby.roomId}
            </td>
            <td className="py-3">{lobby.connectedCount} / 2</td>
            <td className="py-3">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold
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
                className="px-3 py-1 text-xs"
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
