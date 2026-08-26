import { useState } from 'react';
import {
  Folder,
  WindowModal as WindowModalType,
} from '../../components/index-page/indexTypes';
import { AppId } from '../../components/index-page/components/start-menu/menuData';

// Default window size, matching the previous fixed Tailwind classes
// (w-165 = 660px, h-125 = 500px).
const DEFAULT_WIDTH = 660;
const DEFAULT_HEIGHT = 500;
// Message boxes are fixed-size and much smaller than an File Explorer window.
const ERROR_WIDTH = 340;
const ERROR_HEIGHT = 135;
// Windows that only ever have one copy open at a time, opened through openApp.
type SingleInstanceKind =
  'date-time' | 'notepad' | 'paint' | 'settings' | 'cmd';

// Everything that differs between those windows. Adding a new in-page app is
// one entry here plus its 'kind' in indexTypes (and MAXIMIZABLE_KINDS below if
// it's resizable). Sizes are the size the window *opens* at; resizable apps
// are freely resizable afterwards.
const APP_WINDOWS: Record<
  SingleInstanceKind,
  { width: number; height: number; modalName: string; modalIcon?: string }
> = {
  // The Date and Time Properties dialog is fixed-size, like in the Control
  // Panel, and has no title bar icon.
  'date-time': {
    width: 400,
    height: 400,
    modalName: 'Date and Time Properties',
  },
  notepad: {
    width: 500,
    height: 400,
    modalName: 'Untitled - Notepad',
    modalIcon: '/images/index-page/apps/notepad.png',
  },
  // Paint opens larger than Notepad: it's a canvas app that needs room for the
  // toolbox, palette and drawing area.
  paint: {
    width: 720,
    height: 540,
    modalName: 'Paint - https://jspaint.app',
    modalIcon: '/images/index-page/apps/paint.png',
  },
  settings: {
    width: 400,
    height: 400,
    modalName: 'Settings',
    modalIcon: '/images/index-page/start-menu/control-panel.png',
  },
  cmd: {
    width: 400,
    height: 400,
    modalName: 'Command Prompt',
    modalIcon:
      '/images/index-page/start-menu/all-programs/accessories/command-prompt.png',
  },
};

// Window kinds that can be maximized/resized. Message boxes and the Date/Time
// dialog are fixed-size, so they're left out. Add new resizable apps here.
const MAXIMIZABLE_KINDS: WindowModalType['kind'][] = [
  'folder',
  'notepad',
  'paint',
  'cmd',
];

// Height reserved at the bottom of the screen for the (future) taskbar, so a
// maximized window stops just above it like in Windows XP.
const TASKBAR_HEIGHT = 34;
// Gap kept between a freshly opened window and the screen edges, so it never
// opens flush against the sides on small (mobile) viewports.
const WINDOW_MARGIN = 16;

// Owns the desktop's window stack: the list of open windows plus every
// operation that mutates it (focus, close, move, resize, minimize, maximize)
// and every "open X" launcher. Index.tsx consumes this so it can stay focused
// on layout instead of window bookkeeping.
export function useWindows() {
  const [windowModal, setWindowModal] = useState<WindowModalType[]>([]);

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

  const closeWindow = (uuid: string) => {
    setWindowModal((prev) => prev.filter((w) => w.uuid !== uuid));
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
        // Only resizable windows have a maximize control. Message boxes and the
        // Date/Time dialog are fixed-size, so ignore them
        if (!MAXIMIZABLE_KINDS.includes(w.kind)) return w;
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
      const existing = prev.find(
        (w) => w.kind === 'folder' && w.modalName === folder.name,
      );
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
          kind: 'folder',
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

  // Open an XP message box. Unlike folders these are never deduplicated: two
  // errors with the same title are two separate dialogs.
  const openError = (title: string, message: string) => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const width = Math.min(ERROR_WIDTH, viewportWidth - WINDOW_MARGIN * 2);
    const height = Math.min(
      ERROR_HEIGHT,
      viewportHeight - TASKBAR_HEIGHT - WINDOW_MARGIN * 2,
    );

    // play error sound when error window opens
    void new Audio('/sounds/index-page/error.wav').play();

    setWindowModal((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 0);
      // A message box opens centred on the desktop, like in XP.
      const left = Math.max(
        WINDOW_MARGIN,
        Math.round((viewportWidth - width) / 2),
      );
      const top = Math.max(
        WINDOW_MARGIN,
        Math.round((viewportHeight - TASKBAR_HEIGHT - height) / 2),
      );
      return [
        // A new window steals focus, so clear it from the previous one.
        ...prev.map((w) => (w.isFocused ? { ...w, isFocused: false } : w)),
        {
          kind: 'error',
          uuid: crypto.randomUUID(),
          isOpen: true,
          isFocused: true,
          zIndex: maxZ + 1,
          top,
          left,
          width,
          height,
          isMaximized: false,
          isMinimized: false,
          modalName: title,
          message,
        },
      ];
    });
  };

  // Open a single-instance window, or focus it if it's already open. Only one
  // copy of each can exist at the time, so a desktop icon acts as a toggle-to-front
  // rather than adding duplicates. These all open centred on the desktop.
  const openApp = (kind: SingleInstanceKind) => {
    const app = APP_WINDOWS[kind];
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const width = Math.min(app.width, viewportWidth - WINDOW_MARGIN * 2);
    const height = Math.min(
      app.height,
      viewportHeight - TASKBAR_HEIGHT - WINDOW_MARGIN * 2,
    );

    setWindowModal((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 0);
      const existing = prev.find((w) => w.kind === kind);
      if (existing) {
        return prev.map((w) =>
          w.uuid === existing.uuid
            ? { ...w, zIndex: maxZ + 1, isFocused: true, isOpen: true }
            : w.isFocused
              ? { ...w, isFocused: false }
              : w,
        );
      }
      const left = Math.max(
        WINDOW_MARGIN,
        Math.round((viewportWidth - width) / 2),
      );
      const top = Math.max(
        WINDOW_MARGIN,
        Math.round((viewportHeight - TASKBAR_HEIGHT - height) / 2),
      );
      return [
        ...prev.map((w) => (w.isFocused ? { ...w, isFocused: false } : w)),
        {
          kind,
          uuid: crypto.randomUUID(),
          isOpen: true,
          isFocused: true,
          zIndex: maxZ + 1,
          top,
          left,
          width,
          height,
          isMaximized: false,
          isMinimized: false,
          modalName: app.modalName,
          modalIcon: app.modalIcon,
        },
      ];
    });
  };

  // Named wrappers, so callers read as openNotepad() rather than
  // openApp('notepad') at every call site.
  const openDateTime = () => openApp('date-time');
  const openNotepad = () => openApp('notepad');
  const openPaint = () => openApp('paint');
  const openSettings = () => openApp('settings');
  const openCmd = () => openApp('cmd');

  // Maps a Start Menu app id to the window it opens. Every AppId is a key of
  // APP_WINDOWS, so a new in-page app (CMD, etc...) only needs an entry there.
  const launchApp = (app: AppId) => openApp(app);

  return {
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
    openSettings,
    openCmd,
    launchApp,
  };
}
