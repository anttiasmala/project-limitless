export const PATH = '/images/index-page/start-menu';

export const FOLDER_ICON = '/images/index-page/folder/folder-and-calendar.png';

// Shown when a menu item that was never implemented is clicked
export const notFoundMessage = (name: string) =>
  `Application '${name}' does not exist.`;

export const ICONS: {
  text: string;
  icon: string;
  isSubMenu?: boolean;
  isSeparator?: boolean;
}[] = [
  {
    text: 'My Documents',
    icon: `${PATH}/my-documents.png`,
  },
  {
    text: 'My Recent Documents',
    icon: `${PATH}/my-recent-documents.png`,
    isSubMenu: true,
  },
  {
    text: 'My Pictures',
    icon: `${PATH}/my-pictures.png`,
  },
  {
    text: 'My Music',
    icon: `${PATH}/my-music.png`,
  },
  {
    text: 'My Computer',
    icon: `${PATH}/my-computer.png`,
  },
  {
    text: 'Separator',
    icon: `${PATH}/my-computer.png`,
    isSeparator: true,
  },

  {
    text: 'Control Panel',
    icon: `${PATH}/control-panel.png`,
  },
  {
    text: 'Default Programs',
    icon: `${PATH}/default-programs.png`,
  },
  {
    text: 'Printers',
    icon: `${PATH}/printers.png`,
  },
  {
    text: 'Separator',
    icon: `${PATH}/my-computer.png`,
    isSeparator: true,
  },
  {
    text: 'Help and Support',
    icon: `${PATH}/help-and-support.png`,
  },
  {
    text: 'Search',
    icon: `/images/index-page/folder/magnifying-glass.png`,
  },
  {
    text: 'Run...',
    icon: `${PATH}/run.png`,
  },
];

// Id of an in-page windowed app the desktop knows how to open
export type AppId = 'notepad' | 'paint';

export type SubMenuEntry = {
  text: string;
  icon?: string;
  isSubMenu?: boolean;
  // Opens this path in a new browser tab (e.g. Calculator), shown with a ↗ badge.
  href?: string;
  // Opens an in-page windowed app on the desktop (e.g. Notepad), like the
  // matching desktop icon. Add new apps (e.g. CMD, Paint) by extending AppId.
  app?: AppId;
};

// Contents of each hovered window, keyed by the parent item's `text`. An empty array renders the greyed-out
// "(Empty)" placeholder.
export const SUB_MENUS: Record<string, SubMenuEntry[]> = {
  'My Recent Documents': [],
  Accessories: [
    {
      text: 'Calculator',
      icon: `${PATH}/all-programs/accessories/calculator.png`,
      href: '/calculator',
    },
    {
      text: 'Notepad',
      icon: `${PATH}/all-programs/accessories/notepad.png`,
      app: 'notepad',
    },
    {
      text: 'Paint',
      icon: `${PATH}/all-programs/accessories/paint.png`,
      app: 'paint',
    },
    {
      text: 'Command Prompt',
      icon: `${PATH}/all-programs/accessories/command-prompt.png`,
    },
  ],
  Games: [
    { text: 'Minesweeper', icon: `${PATH}/all-programs/games/minesweeper.png` },
    { text: 'Solitaire', icon: `${PATH}/all-programs/games/solitaire.png` },
    { text: 'Pinball', icon: `${PATH}/all-programs/games/pinball.png` },
  ],
  Startup: [],
  'All Programs': [
    { text: 'Accessories', icon: FOLDER_ICON, isSubMenu: true },
    { text: 'Games', icon: FOLDER_ICON, isSubMenu: true },
    { text: 'Startup', icon: FOLDER_ICON, isSubMenu: true },
    { text: 'Internet Explorer', icon: `${PATH}/internet-explorer.png` },
    {
      text: 'Windows Media Player',
      icon: `${PATH}/all-programs/windows-media-player.png`,
    },
  ],
};
