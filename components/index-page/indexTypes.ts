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

export type WindowModal = {
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
  restoreRect?: { top: number; left: number; width: number; height: number };
  modalName: string;
  modalIcon: string;
  items: FolderApp[];
};
