// app/multiplayer/lobby/page.tsx
'use client';

import Lobby from '@/components/multiplayer/Lobby';
import Button from '../utils/Button';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyPress } from '@/hooks/useKeyPress';
import usePreventBackgroundScrolling from '@/hooks/usePreventBackgroundScrolling';
import { ICON_LIST as PIRATE_ICONS } from '@/components/settings/IconPickerModal';

export default function LobbyPage() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profile, setProfile] = useLocalStorage('multiplayerProfile', {
    name: 'Davy Jones',
    icon: '☠️',
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-slate-300 bg-white/80 p-4 sm:p-8 dark:border-amber-800 dark:bg-amber-950/40">
        <div className="mb-2 flex justify-end">
          <Button
            variant="unstyled"
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 border-2 border-slate-300 bg-white/60 px-3 py-1.5 text-sm text-slate-700 hover:border-amber-500 dark:border-amber-700 dark:bg-amber-900/40 dark:text-yellow-300 dark:hover:border-amber-500"
          >
            <span className="text-lg leading-none">{profile.icon}</span>
            <span>{profile.name}</span>
          </Button>
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
      <div className="fixed inset-0 z-98 overflow-y-auto bg-black/80" />

      <div className="fixed inset-0 z-101 overflow-y-auto">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pirate Profile"
          className="flex min-h-full items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pirate profile"
            className="relative z-99 flex w-[90vw] max-w-sm flex-col gap-5 rounded-xl border-2 border-amber-800 bg-amber-50 p-6 shadow-2xl dark:border-amber-700 dark:bg-amber-950"
          >
          <div className="flex items-center justify-center">
            <h2 className="text-center text-lg font-black tracking-wide text-amber-700 dark:text-yellow-400">
              ☠️ Pirate Profile
            </h2>
            <span className="group absolute right-4">
              <Button
                variant="unstyled"
                onClick={() => {
                  setProfile({ icon: '☠️', name: 'Davy Jones' });
                  onClose();
                }}
              >
                🔄
              </Button>
              <span className="pointer-events-none absolute top-full right-0 z-50 mt-1 hidden rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
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
              className="rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none dark:border-amber-700 dark:bg-amber-900 dark:text-yellow-300"
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-yellow-300">
              Icon
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PIRATE_ICONS.map((icon) => (
                <Button
                  key={icon}
                  variant="unstyled"
                  onClick={() => setLocalIcon(icon)}
                  className={`border-2 p-2 text-2xl ${
                    localIcon === icon
                      ? 'border-amber-600 bg-amber-100 dark:border-amber-400 dark:bg-amber-800'
                      : 'border-transparent hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-900'
                  }`}
                  aria-label={icon}
                  aria-pressed={localIcon === icon}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 border-amber-800 bg-amber-600 text-white hover:bg-amber-500 dark:border-yellow-500 dark:bg-amber-700 dark:text-yellow-300 dark:hover:bg-amber-600"
              onClick={handleSave}
            >
              ⚓ Save
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>,
    document.body,
  );
}
