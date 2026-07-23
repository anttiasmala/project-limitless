export type FolderApp = {
  name: string;
  icon: string;
  href: string;
};

export type Folder = {
  name: string;
  icon: string;
  items: FolderApp[];
};

// Everything the desktop needs in order to place, stack, focus and list a
// window on the taskbar.
type BaseWindowModal = {
  uuid: string;
  isOpen: boolean;
  isFocused: boolean;
  zIndex: number;
  top: number;
  left: number;
  width: number;
  height: number;
  // When maximized the window fills the viewport (minus the taskbar) and the
  // pre-maximize position/size is kept in restoreRect so it can be restored.
  isMaximized: boolean;
  isMinimized: boolean;
  // Saves position of window when maximized, so when window is unmaximized, the window will remember its position
  restoreRect?: { top: number; left: number; width: number; height: number };
  modalName: string;
  // Drawn in the title bar and on the taskbar button. Optional because XP
  // message boxes have no title bar icon.
  modalIcon?: string;
};

// A File Explorer window: full folder (menus, toolbar, address bar,
// sidebar) around a grid of items.
export type FolderWindowModal = BaseWindowModal & {
  kind: 'folder';
  items: FolderApp[];
};

// An XP message box: fixed size, close button only.
export type ErrorWindowModal = BaseWindowModal & {
  kind: 'error';
  message: string;
};

// The Control Panel's "Date and Time Properties" dialog, opened by clicking the
// taskbar clock. Fixed size and close-only, like a message box.
export type DateTimeWindowModal = BaseWindowModal & {
  kind: 'date-time';
};

// Windows XP Notepad: a resizable window whose whole body is a plain-text
// editor. The typed text lives inside the window component's own state (it
// survives minimizing because the component stays mounted), so nothing extra
// is needed on the modal here.
export type NotepadWindowModal = BaseWindowModal & {
  kind: 'notepad';
};

export type PaintWindowModal = BaseWindowModal & {
  kind: 'paint';
};

export type WindowModal =
  | FolderWindowModal
  | ErrorWindowModal
  | DateTimeWindowModal
  | NotepadWindowModal
  | PaintWindowModal;
