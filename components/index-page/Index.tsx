'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MarqueeRect, useMarquee } from '../../hooks/index-page/useMarquee';
import Button from '../shared/Button';
import Notepad from './components/apps/Notepad';
import DateTimeWindow from './components/window/DateTimeWindow';
import ErrorWindow from './components/window/ErrorWindow';
import FolderWindow from './components/window/FolderWindow';
import { FOLDERS } from './folders';
import { Folder } from './indexTypes';
import StartMenu from './components/start-menu/StartMenu';
import ShutdownMenu from './components/shutdown-menu/ShutdownMenu';
import DesktopContextMenu, {
  ContextMenuItem,
} from './components/context-menu/DesktopContextMenu';
import {
  buildAppMenu,
  buildDesktopMenu,
  buildFolderMenu,
} from './components/context-menu/menuItems';
import Paint from './components/apps/Paint';
import { useWindows } from '../../hooks/index-page/useWindows';

export default function Index() {
  const [showShutdownMenu, setShowShutdownMenu] = useState<{
    type: 'turnOffComputer' | 'logOff';
    show: boolean;
  }>({ type: 'turnOffComputer', show: false });

  const [desktopMenuItems, setDesktopMenuItems] = useState<ContextMenuItem[]>(
    [],
  );
  // Desktop right-click menu, positioned at the cursor (viewport coords) while
  // open; null when closed.
  const [rightClickMenu, setRightClickMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState('');
  // The desktop clock is the real clock plus an offset, so "setting" the time
  // in Date and Time Properties never touches the user's actual system clock.
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [timeZoneHours, setTimeZoneHours] = useState(
    () => -new Date().getTimezoneOffset() / 60,
  );

  const {
    windowModal,
    setWindowModal,
    focusWindow,
    closeWindow,
    moveWindow,
    resizeWindow,
    toggleMinimize,
    toggleMaximize,
    openFolder,
    openError,
    openDateTime,
    openNotepad,
    openPaint,
    launchApp,
  } = useWindows();
  // Desktop folders currently highlighted by a click or a marquee drag.
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    () => new Set(),
  );

  // The <main> element (marquee container) and each folder button, so the
  // marquee can hit-test folder icons in the container's coordinate space.
  const desktopRef = useRef<HTMLElement>(null);
  const appRefs = useRef(new Map<string, HTMLButtonElement>());

  const startMenuRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Tracks the last folder tap so we can detect a double-tap manually. The
  // native onDoubleClick event never fires on touch devices, so on mobile a
  // folder could otherwise never be opened. This is a workaround
  const lastTapRef = useRef<{ name: string; time: number } | null>(null);
  const DOUBLE_TAP_MS = 400;

  // Clear focus + selection when a marquee starts (mouse-down on empty desktop).
  const clearDesktop = () => {
    setSelectedApps((prev) => (prev.size ? new Set() : prev));
    setWindowModal((prev) =>
      prev.some((w) => w.isFocused)
        ? prev.map((w) => (w.isFocused ? { ...w, isFocused: false } : w))
        : prev,
    );
    setRightClickMenu(null);
  };

  // Highlight every folder whose icon intersects the current marquee rectangle.
  const selectWithinMarquee = (marquee: MarqueeRect) => {
    const container = desktopRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const next = new Set<string>();
    appRefs.current.forEach((el, name) => {
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
    setSelectedApps(next);
  };

  const { rect: marqueeRect, onMouseDown: onMarqueeDown } = useMarquee(
    desktopRef,
    { onStart: clearDesktop, onChange: selectWithinMarquee },
  );

  // Close the Start Menu when a click lands outside it. The Start button
  // is excluded so its click can still toggle the menu closed instead of the
  // outside-handler closing it and the button's onClick reopening it.
  useEffect(() => {
    if (!showStartMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        startMenuRef.current?.contains(target) ||
        startButtonRef.current?.contains(target)
      ) {
        return;
      }
      setShowStartMenu(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showStartMenu]);

  useEffect(() => {
    const updateTime = () => {
      const dateTime = new Date(Date.now() + clockOffsetMs);
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      setTime(`${dateTime.getHours()}:${minutes}`);
    };
    const timeout = setTimeout(updateTime, 0);
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [clockOffsetMs]);

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

  // Placeholder action for the many menu entries that aren't wired to real
  // behavior yet: pops an XP message box, like the Start Menu's placeholders.
  const menuError = (name: string) => () =>
    openError(name, `'${name}' is not available.`);

  return (
    <main
      ref={desktopRef}
      className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 bg-[url(/images/index-page/background.jpeg)] bg-cover px-4"
      // Windows XP fades the desktop to gray when the Turn Off / Log Off dialog opens
      style={{
        transition: showShutdownMenu.show
          ? 'filter 3000ms ease'
          : 'filter 1ms ease',
        filter: showShutdownMenu.show ? 'grayscale(1)' : undefined,
      }}
      onMouseDown={onMarqueeDown}
      onContextMenu={(e) => {
        e.preventDefault();
        // Folders and the taskbar stop propagation and handle their own
        // right-click, so anything reaching here is the bare desktop.
        setDesktopMenuItems(buildDesktopMenu({ menuError, clearDesktop }));
        setRightClickMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {rightClickMenu && (
        <DesktopContextMenu
          x={rightClickMenu.x}
          y={rightClickMenu.y}
          items={desktopMenuItems}
          onClose={() => setRightClickMenu(null)}
        />
      )}

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
          const isSelected = selectedApps.has(folder.name);
          return (
            <Button
              key={folder.name}
              ref={(el) => {
                if (el) appRefs.current.set(folder.name, el);
                else appRefs.current.delete(folder.name);
              }}
              variant="unstyled"
              className="flex cursor-default flex-col"
              onMouseDown={(e) => {
                // Select just this folder; stop the press from starting a
                // marquee / clearing the selection on the desktop.
                e.stopPropagation();
                setSelectedApps(new Set([folder.name]));
              }}
              onClick={(e) => handleFolderActivate(folder, e.timeStamp)}
              onContextMenu={(e) => {
                e.preventDefault();
                // Keep this from bubbling to <main>, which would replace the
                // folder menu with the desktop menu.
                e.stopPropagation();
                setDesktopMenuItems(
                  buildFolderMenu(folder, { menuError, openFolder }),
                );
                setRightClickMenu({ x: e.clientX, y: e.clientY });
              }}
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
        <Button
          ref={(el) => {
            // Register alongside the folders so the marquee can highlight
            // this icon with the same generic selection logic.
            if (el) appRefs.current.set('Notepad', el);
            else appRefs.current.delete('Notepad');
          }}
          variant="unstyled"
          className="flex cursor-default flex-col items-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            setSelectedApps(new Set(['Notepad']));
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDesktopMenuItems(
              buildAppMenu('Notepad', { menuError, openApp: openNotepad }),
            );
            setRightClickMenu({ x: e.clientX, y: e.clientY });
          }}
          onClick={(e) => {
            // Same manual double-tap as folders, so one gesture opens Notepad
            // on both desktop (double-click) and touch (double-tap).
            const now = e.timeStamp;
            const last = lastTapRef.current;
            if (
              last &&
              last.name === 'Notepad' &&
              now - last.time < DOUBLE_TAP_MS
            ) {
              lastTapRef.current = null;
              openNotepad();
            } else {
              lastTapRef.current = { name: 'Notepad', time: now };
            }
          }}
        >
          <Image
            alt="Notepad icon"
            src={'/images/index-page/apps/notepad.png'}
            width={32}
            height={32}
            className={selectedApps.has('Notepad') ? 'opacity-50' : ''}
          />
          <span
            className={`text-sm ${
              selectedApps.has('Notepad') ? 'bg-[#0b61ff] text-white' : ''
            }`}
          >
            Notepad
          </span>
        </Button>

        <Button
          ref={(el) => {
            // Register alongside the folders so the marquee can highlight
            // this icon with the same generic selection logic.
            if (el) appRefs.current.set('Paint', el);
            else appRefs.current.delete('Paint');
          }}
          variant="unstyled"
          className="flex cursor-default flex-col items-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            setSelectedApps(new Set(['Paint']));
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDesktopMenuItems(
              buildAppMenu('Paint', { menuError, openApp: openPaint }),
            );
            setRightClickMenu({ x: e.clientX, y: e.clientY });
          }}
          onClick={(e) => {
            // Same manual double-tap as folders, so one gesture opens Paint
            // on both desktop (double-click) and touch (double-tap).
            const now = e.timeStamp;
            const last = lastTapRef.current;
            if (
              last &&
              last.name === 'Paint' &&
              now - last.time < DOUBLE_TAP_MS
            ) {
              lastTapRef.current = null;
              openPaint();
            } else {
              lastTapRef.current = { name: 'Paint', time: now };
            }
          }}
        >
          <Image
            alt="Paint icon"
            src={'/images/index-page/apps/paint.png'}
            width={32}
            height={32}
            className={selectedApps.has('Paint') ? 'opacity-50' : ''}
          />
          <span
            className={`text-sm ${
              selectedApps.has('Paint') ? 'bg-[#0b61ff] text-white' : ''
            }`}
          >
            Paint
          </span>
        </Button>
      </div>

      {windowModal.map((modal) =>
        modal.kind === 'folder' ? (
          <FolderWindow
            key={modal.uuid}
            modal={modal}
            onFocus={focusWindow}
            onMove={moveWindow}
            onMinimize={toggleMinimize}
            onMaximize={toggleMaximize}
            onResize={resizeWindow}
            onClose={closeWindow}
          />
        ) : modal.kind === 'error' ? (
          <ErrorWindow
            key={modal.uuid}
            modal={modal}
            onFocus={focusWindow}
            onMove={moveWindow}
            onClose={closeWindow}
          />
        ) : modal.kind === 'notepad' ? (
          <Notepad
            key={modal.uuid}
            modal={modal}
            onFocus={focusWindow}
            onMove={moveWindow}
            onMinimize={toggleMinimize}
            onMaximize={toggleMaximize}
            onResize={resizeWindow}
            onClose={closeWindow}
          />
        ) : modal.kind === 'date-time' ? (
          <DateTimeWindow
            key={modal.uuid}
            modal={modal}
            offsetMs={clockOffsetMs}
            timeZoneHours={timeZoneHours}
            onApply={(offset, zone) => {
              setClockOffsetMs(offset);
              setTimeZoneHours(zone);
            }}
            onFocus={focusWindow}
            onMove={moveWindow}
            onClose={closeWindow}
          />
        ) : (
          <Paint
            key={modal.uuid}
            modal={modal}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMove={moveWindow}
            onResize={resizeWindow}
            onMinimize={toggleMinimize}
            onMaximize={toggleMaximize}
          />
        ),
      )}

      {showShutdownMenu.show && (
        <ShutdownMenu
          type={showShutdownMenu.type}
          onClose={() =>
            setShowShutdownMenu((prev) => ({ ...prev, show: false }))
          }
          onOpenError={openError}
        />
      )}

      <footer
        className="fixed bottom-0 left-0 w-full border-t border-t-[#0831d9] bg-[linear-gradient(to_bottom,#1f6dd6_0%,#3f8df5_3%,#2a64dd_6%,#235dd9_10%,#225ad4_55%,#1c4fc4_90%,#1c4fc4_95%,#3068dd_100%)]"
        onContextMenu={(e) => {
          // The taskbar has no menu of its own yet. "Destroy" the right-click so
          // it doesn't fall through to the desktop menu.
          e.preventDefault();
          e.stopPropagation();
          setRightClickMenu(null);
        }}
      >
        <div className="flex flex-row">
          <button
            ref={startButtonRef}
            className="cursor-pointer hover:brightness-110"
            onClick={() => setShowStartMenu((prev) => !prev)}
          >
            <Image
              alt="Start button"
              src={'/images/index-page/taskbar/start-button.png'}
              width={106}
              height={34}
              loading="eager"
            />
          </button>

          {showStartMenu && (
            <StartMenu
              onClose={() => setShowStartMenu(false)}
              onOpenError={openError}
              onLaunchApp={launchApp}
              ref={startMenuRef}
              setShowShutdownMenu={setShowShutdownMenu}
            />
          )}

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
                {modal.modalIcon && (
                  <Image
                    alt="Window icon"
                    src={modal.modalIcon}
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0"
                  />
                )}
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
            <button
              onClick={openDateTime}
              title="Click to adjust date and time"
              className="ml-2 cursor-pointer text-sm select-none"
            >
              {time}
            </button>
          </div>
        </div>
      </footer>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl dark:text-slate-100"></h1>
      </div>
    </main>
  );
}
