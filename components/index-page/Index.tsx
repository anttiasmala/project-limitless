'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MarqueeRect, useMarquee } from '../../hooks/index-page/useMarquee';
import Button from '../shared/Button';
import WindowModal from './components/WindowModal';
import { FOLDERS } from './folders';
import { Folder, WindowModal as WindowModalType } from './indexTypes';
import { nanoid } from 'nanoid';

// Default window size, matching the previous fixed Tailwind classes
// (w-165 = 660px, h-125 = 500px).
const DEFAULT_WIDTH = 660;
const DEFAULT_HEIGHT = 500;
// Height reserved at the bottom of the screen for the (future) taskbar, so a
// maximized window stops just above it like in Windows XP.
const TASKBAR_HEIGHT = 34;
// Gap kept between a freshly opened window and the screen edges, so it never
// opens flush against the sides on small (mobile) viewports.
const WINDOW_MARGIN = 16;

export default function Index() {
  const [time, setTime] = useState('');
  const [windowModal, setWindowModal] = useState<WindowModalType[]>([]);
  // Desktop folders currently highlighted by a click or a marquee drag.
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
    () => new Set(),
  );

  // The <main> element (marquee container) and each folder button, so the
  // marquee can hit-test folder icons in the container's coordinate space.
  const desktopRef = useRef<HTMLElement>(null);
  const folderRefs = useRef(new Map<string, HTMLButtonElement>());

  // Tracks the last folder tap so we can detect a double-tap manually. The
  // native onDoubleClick event never fires on touch devices, so on mobile a
  // folder could otherwise never be opened. This is a workaround
  const lastTapRef = useRef<{ name: string; time: number } | null>(null);
  const DOUBLE_TAP_MS = 400;

  // Clear focus + selection when a marquee starts (mouse-down on empty desktop).
  const clearDesktop = () => {
    setSelectedFolders((prev) => (prev.size ? new Set() : prev));
    setWindowModal((prev) =>
      prev.some((w) => w.isFocused)
        ? prev.map((w) => (w.isFocused ? { ...w, isFocused: false } : w))
        : prev,
    );
  };

  // Highlight every folder whose icon intersects the current marquee rectangle.
  const selectWithinMarquee = (marquee: MarqueeRect) => {
    const container = desktopRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const next = new Set<string>();
    folderRefs.current.forEach((el, name) => {
      const r = el.getBoundingClientRect();
      const left = r.left - bounds.left;
      const top = r.top - bounds.top;
      const intersects =
        left < marquee.left + marquee.width &&
        left + r.width > marquee.left &&
        top < marquee.top + marquee.height &&
        top + r.height > marquee.top;
      if (intersects) next.add(name);
    });
    setSelectedFolders(next);
  };

  const { rect: marqueeRect, onMouseDown: onMarqueeDown } = useMarquee(
    desktopRef,
    { onStart: clearDesktop, onChange: selectWithinMarquee },
  );

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

      if (
        !target ||
        (target.zIndex === maxZ && target.isOpen && target.isFocused)
      )
        return prev;
      return prev.map((w) => {
        if (w.isFocused) {
          w = { ...w, isFocused: false, isOpen: true };
        }
        return w.uuid === uuid
          ? { ...w, zIndex: maxZ + 1, isFocused: true, isOpen: true }
          : w;
      });
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

  const toggleMinimize = (uuid: string) => {
    setWindowModal((prev) => {
      return prev.map((w) => {
        return w.uuid === uuid ? { ...w, isOpen: false, isFocused: false } : w;
      });
    });
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

  // Handle a folder tap/click: select on the first tap, open on a second tap
  // within DOUBLE_TAP_MS. This replaces the native double-click, which never
  // fires on touch devices, so the same gesture works on desktop and mobile.
  const handleFolderActivate = (folder: Folder, now: number) => {
    const last = lastTapRef.current;
    if (last && last.name === folder.name && now - last.time < DOUBLE_TAP_MS) {
      lastTapRef.current = null;
      openFolder(folder);
    } else {
      lastTapRef.current = { name: folder.name, time: now };
    }
  };

  // Open a folder, or focus it if it is already open.
  const openFolder = (folder: Folder) => {
    // Fit the new window to the viewport so it never opens larger than the
    // screen (e.g. on mobile, where it can't be resized or dragged smaller (maybe adding it later)).
    // On larger desktop screens this caps out at the default size, so nothing
    // changes there.
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const width = Math.min(DEFAULT_WIDTH, viewportWidth - WINDOW_MARGIN * 2);
    const height = Math.min(
      DEFAULT_HEIGHT,
      viewportHeight - TASKBAR_HEIGHT - WINDOW_MARGIN * 2,
    );

    setWindowModal((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 0);
      const existing = prev.find((w) => w.modalName === folder.name);
      if (existing) {
        // Focus the already-open window: bring it to the front and move the
        // focus highlight off whichever window currently has it.
        return prev.map((w) =>
          w.uuid === existing.uuid
            ? { ...w, zIndex: maxZ + 1, isFocused: true, isOpen: true }
            : w.isFocused
              ? { ...w, isFocused: false }
              : w,
        );
      }
      const offset = prev.length * 24;

      // Move from the usual spot, but clamp so the window stays fully
      // on-screen (above the taskbar) no matter how small the viewport is.
      const left = Math.max(
        WINDOW_MARGIN,
        Math.min(40 + offset, viewportWidth - width - WINDOW_MARGIN),
      );
      const top = Math.max(
        WINDOW_MARGIN,
        Math.min(
          96 + offset,
          viewportHeight - TASKBAR_HEIGHT - height - WINDOW_MARGIN,
        ),
      );
      return [
        // A new window steals focus, so clear it from the previous one.
        ...prev.map((w) => (w.isFocused ? { ...w, isFocused: false } : w)),
        {
          // CHECK THIS, so I don't forget to change nanoid to crypto. Theoratically shouldn't be an issue to use nanoid, but let's go with crypto.randomUUID()
          // crypto does not work on unsecure (HTTP-connection) so let's use nanoid instead during dev and testing
          // with nanoid, I can test with my phone the site (it has HTTP-connection)
          uuid: crypto.randomUUID(),
          //uuid: nanoid(),
          isOpen: true,
          isFocused: true,
          zIndex: maxZ + 1,
          top,
          left,
          width,
          height,
          isMaximized: false,
          isMinimized: false,
          modalIcon: '/images/index-page/folder/folder-opened-icon.png',
          modalName: folder.name,
          items: folder.items,
        },
      ];
    });
  };

  return (
    <main
      ref={desktopRef}
      className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 bg-[url(/images/index-page/background.jpeg)] bg-cover px-4"
      onMouseDown={onMarqueeDown}
    >
      {/* Rubber-band selection rectangle, drawn while dragging on the desktop */}
      {marqueeRect && (
        <div
          className="pointer-events-none absolute z-30 border border-[#3f8df5] bg-[#3f8df5]/25"
          style={{
            left: marqueeRect.left,
            top: marqueeRect.top,
            width: marqueeRect.width,
            height: marqueeRect.height,
          }}
        />
      )}

      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-white"
      >
        ← Home
      </Link>

      <div className="absolute top-20 left-10 flex flex-col gap-3">
        {FOLDERS.map((folder) => {
          const isSelected = selectedFolders.has(folder.name);
          return (
            <Button
              key={folder.name}
              ref={(el) => {
                if (el) folderRefs.current.set(folder.name, el);
                else folderRefs.current.delete(folder.name);
              }}
              variant="unstyled"
              className="flex cursor-default flex-col"
              onMouseDown={(e) => {
                // Select just this folder; stop the press from starting a
                // marquee / clearing the selection on the desktop.
                e.stopPropagation();
                setSelectedFolders(new Set([folder.name]));
              }}
              onClick={(e) => handleFolderActivate(folder, e.timeStamp)}
            >
              <Image
                alt="Folder icon"
                src={folder.icon}
                width={32}
                height={32}
                className={isSelected ? 'opacity-50' : ''}
              />
              <span
                className={`text-sm ${
                  isSelected ? 'bg-[#0b61ff] text-white' : ''
                }`}
              >
                {folder.name}
              </span>
            </Button>
          );
        })}
      </div>

      {windowModal.map((modal) => (
        <WindowModal
          key={modal.uuid}
          modal={modal}
          onFocus={focusWindow}
          onMove={moveWindow}
          onMinimize={toggleMinimize}
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
        <div className="flex flex-row">
          <Image
            alt="Start button"
            src={'/images/index-page/taskbar/start-button.png'}
            width={106}
            height={34}
            loading="eager"
          />
          <div className="flex min-w-0 flex-1 flex-row pr-24 text-sm">
            {windowModal.map((modal) => (
              <button
                key={modal.uuid}
                className={`mt-1 ml-2 flex max-w-40 min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-[3px] border border-[#1c4fc4] px-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ${
                  modal.isFocused
                    ? 'bg-[linear-gradient(to_bottom,#1c4fc4_0%,#2a64dd_50%,#3f8df5_100%)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]'
                    : 'bg-[linear-gradient(to_bottom,#3f8df5_0%,#2a64dd_50%,#225ad4_100%)] hover:brightness-110'
                }`}
                onClick={() =>
                  modal.isOpen && modal.isFocused
                    ? toggleMinimize(modal.uuid)
                    : focusWindow(modal.uuid)
                }
              >
                <Image
                  alt="Window icon"
                  src={modal.modalIcon}
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0"
                />
                <p className="min-w-0 truncate">{modal.modalName}</p>
              </button>
            ))}
          </div>
        </div>
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
