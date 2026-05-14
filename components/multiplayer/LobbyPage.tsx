// app/multiplayer/lobby/page.tsx
'use client';

import Lobby from '@/components/multiplayer/Lobby';
import Button from '../utils/Button';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyPress } from '@/hooks/useKeyPress';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';

const PIRATE_ICONS = [
  '☠️',
  '⚓',
  '🏴‍☠️',
  '🦜',
  '🗡️',
  '🪙',
  '💎',
  '🌊',
  '🍺',
  '🔱',
];

export default function LobbyPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profile, setProfile] = useLocalStorage('multiplayerProfile', {
    name: 'Davy Jones',
    icon: '☠️',
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className="bg-white/80 border-2 border-slate-300 dark:bg-amber-950/40
        dark:border-amber-800 rounded-2xl p-4 sm:p-8 w-full max-w-lg"
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2
              border-slate-300 dark:border-amber-700
              bg-white/60 dark:bg-amber-900/40
              text-slate-700 dark:text-yellow-300
              hover:border-amber-500 dark:hover:border-amber-500
              transition-colors text-sm font-semibold cursor-pointer"
          >
            <span className="text-lg leading-none">{profile.icon}</span>
            <span>{profile.name}</span>
          </button>
        </div>
        <Lobby />
        {showProfileModal && (
          <ProfileModal
            onClose={() => setShowProfileModal(false)}
            setProfile={setProfile}
            profile={profile}
          />
        )}
      </div>
    </main>
  );
}

function ProfileModal({
  onClose,
  setProfile,
  profile,
}: {
  onClose: () => void;
  setProfile: (p: { icon: string; name: string }) => void;
  profile: { icon: string; name: string };
}) {
  const [localName, setLocalName] = useState(profile.name);
  const [localIcon, setLocalIcon] = useState(profile.icon);

  useKeyPress('Escape', onClose, true);
  usePreventBackgroundScrolling(true);

  function handleSave() {
    setProfile({
      name: localName.trim() || 'Davy Jones',
      icon: localIcon,
    });
    onClose();
  }

  return createPortal(
    <div className="relative">
      {/* Backdrop */}
      <div
        className="fixed overflow-y-auto inset-0 z-98 bg-black/80"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pirate Profile"
        className="fixed inset-0 z-101 flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pirate profile"
          className="relative top-[10vh] z-99 
          w-[90vw] max-w-sm
          bg-amber-50 dark:bg-amber-950
          border-2 border-amber-800 dark:border-amber-700
          rounded-xl shadow-2xl p-6 flex flex-col gap-5"
        >
          <div className="flex items-center justify-center">
            <h2 className="text-lg font-black text-amber-700 dark:text-yellow-400 text-center tracking-wide">
              ☠️ Pirate Profile
            </h2>
            <span className="absolute right-4 group">
              <button
                className="hover:cursor-pointer"
                onClick={() => {
                  setProfile({ icon: '☠️', name: 'Davy Jones' });
                  onClose();
                }}
              >
                🔄
              </button>
              <span className="pointer-events-none absolute top-full right-0 mt-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                Reset profile
              </span>
            </span>
          </div>

          {/* Preview */}
          <div className="text-center text-5xl" aria-hidden="true">
            {localIcon}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="pirate-name"
              className="text-sm font-semibold text-slate-700 dark:text-yellow-300"
            >
              Pirate Name
            </label>
            <input
              id="pirate-name"
              maxLength={20}
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="px-3 py-2 border-2 border-slate-300 dark:border-amber-700 rounded-lg
              bg-white dark:bg-amber-900
              text-slate-800 dark:text-yellow-300
              focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-yellow-300">
              Icon
            </span>
            <div className="grid grid-cols-5 gap-2">
              {PIRATE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setLocalIcon(icon)}
                  className={`text-2xl p-2 rounded-lg border-2 transition-all cursor-pointer
                  ${
                    localIcon === icon
                      ? 'border-amber-600 bg-amber-100 dark:bg-amber-800 dark:border-amber-400'
                      : 'border-transparent hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-900'
                  }`}
                  aria-label={icon}
                  aria-pressed={localIcon === icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 border-amber-800
              dark:bg-amber-700 dark:hover:bg-amber-600 dark:border-yellow-500
              dark:text-yellow-300 text-white"
              onClick={handleSave}
            >
              ⚓ Save
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
