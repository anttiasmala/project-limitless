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

export type WindowModal = FolderWindowModal | ErrorWindowModal;
