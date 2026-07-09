'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../shared/Button';
import WindowModal from './components/WindowModal';
import { FOLDERS } from './folders';
import { Folder, WindowModal as WindowModalType } from './indexTypes';

// Default window size, matching the previous fixed Tailwind classes
// (w-165 = 660px, h-125 = 500px).
const DEFAULT_WIDTH = 660;
const DEFAULT_HEIGHT = 500;
// Height reserved at the bottom of the screen for the (future) taskbar, so a
// maximized window stops just above it like in Windows XP.
const TASKBAR_HEIGHT = 34;

export default function Index() {
  const [time, setTime] = useState('');
  const [windowModal, setWindowModal] = useState<WindowModalType[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const dateTime = new Date();
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      setTime(`${dateTime.getHours()}:${minutes}`);
    };
    const timeout = setTimeout(updateTime, 0);
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Bring a window to the front by giving it the highest z-index.
  const focusWindow = (uuid: string) => {
    setWindowModal((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 0);
      const target = prev.find((w) => w.uuid === uuid);
      if (!target || target.zIndex === maxZ) return prev;
      return prev.map((w) =>
        w.uuid === uuid ? { ...w, zIndex: maxZ + 1 } : w,
      );
    });
  };

  // Persist a window's position after a drag.
  const moveWindow = (uuid: string, top: number, left: number) => {
    setWindowModal((prev) =>
      prev.map((w) => (w.uuid === uuid ? { ...w, top, left } : w)),
    );
  };

  const resizeWindow = (uuid: string, width: number, height: number) => {
    setWindowModal((prev) =>
      prev.map((w) => (w.uuid === uuid ? { ...w, width, height } : w)),
    );
  };

  // Toggle a window between maximized (filling the viewport above the taskbar)
  // and its previous position/size.
  const toggleMaximize = (uuid: string) => {
    setWindowModal((prev) =>
      prev.map((w) => {
        if (w.uuid !== uuid) return w;
        if (w.isMaximized && w.restoreRect) {
          return {
            ...w,
            isMaximized: false,
            top: w.restoreRect.top,
            left: w.restoreRect.left,
            width: w.restoreRect.width,
            height: w.restoreRect.height,
            restoreRect: undefined,
          };
        }
        return {
          ...w,
          isMaximized: true,
          restoreRect: {
            top: w.top,
            left: w.left,
            width: w.width,
            height: w.height,
          },
          top: 0,
          left: 0,
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight - TASKBAR_HEIGHT,
        };
      }),
    );
  };

  // Open a folder, or focus it if it is already open.
  const openFolder = (folder: Folder) => {
    setWindowModal((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 0);
      const existing = prev.find((w) => w.modalName === folder.name);
      if (existing) {
        return prev.map((w) =>
          w.uuid === existing.uuid ? { ...w, zIndex: maxZ + 1 } : w,
        );
      }
      const offset = prev.length * 24;
      return [
        ...prev,
        {
          uuid: crypto.randomUUID(),
          isOpen: true,
          zIndex: maxZ + 1,
          top: 96 + offset,
          left: 40 + offset,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          isMaximized: false,
          modalIcon: '/images/index-page/folder/folder-opened-icon.png',
          modalName: folder.name,
          items: folder.items,
        },
      ];
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 bg-[url(/images/index-page/background.jpeg)] bg-cover px-4">
      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-white"
      >
        ← Home
      </Link>

      <div className="absolute top-20 left-10 flex flex-col gap-3">
        {FOLDERS.map((folder) => (
          <Button
            key={folder.name}
            variant="unstyled"
            className="group flex cursor-default flex-col"
            onDoubleClick={() => openFolder(folder)}
          >
            <Image
              alt="Folder icon"
              src={folder.icon}
              width={32}
              height={32}
              className="group-focus:opacity-50"
            />
            <span className="text-sm group-focus:bg-[#0b61ff] group-focus:opacity-100">
              {folder.name}
            </span>
          </Button>
        ))}
      </div>

      {windowModal.map((modal) => (
        <WindowModal
          key={modal.uuid}
          modal={modal}
          onFocus={focusWindow}
          onMove={moveWindow}
          onMaximize={toggleMaximize}
          onResize={resizeWindow}
          onClose={(uuid) =>
            setWindowModal((prev) =>
              prev.filter((modal) => modal.uuid !== uuid),
            )
          }
        />
      ))}

      <footer className="fixed bottom-0 left-0 w-full border-t border-t-[#0831d9] bg-[linear-gradient(to_bottom,#1f6dd6_0%,#3f8df5_3%,#2a64dd_6%,#235dd9_10%,#225ad4_55%,#1c4fc4_90%,#1c4fc4_95%,#3068dd_100%)]">
        <Image
          alt="Start button"
          src={'/images/index-page/taskbar/start-button.png'}
          width={106}
          height={34}
          loading="eager"
        />
        <div className="absolute right-0 bottom-0 flex h-full w-24 flex-row border-l border-l-[#0c3aa5] bg-[linear-gradient(to_bottom,#14a5f0_0%,#128ee8_50%,#0e7ad9_100%)] shadow-[inset_1px_0_0_#3a9ff5]">
          <div className="flex h-full w-full items-center">
            <div className="ml-3">
              <Image
                alt="Sound icon"
                src={'/images/index-page/taskbar/sound.png'}
                height={16}
                width={16}
              />
            </div>
            <Image
              alt="Shield icon"
              src={'/images/index-page/taskbar/shield.png'}
              height={16}
              width={16}
            />
            <p className="ml-2 text-sm select-none">{time}</p>
          </div>
        </div>
      </footer>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl dark:text-slate-100"></h1>
      </div>
    </main>
  );
}
