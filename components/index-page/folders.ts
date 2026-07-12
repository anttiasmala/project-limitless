import { Folder } from './indexTypes';

// Placeholder icon used until real per-app icons are added.
const APP_ICON = '/images/index-page/folder/folder-opened-icon.png';
const FOLDER_ICON = '/images/index-page/folder-icon.png';
const PATH = '/images/index-page/folder';

// Desktop folders and the apps they contain. Add new folders/apps here.
export const FOLDERS: Folder[] = [
  {
    name: 'Games',
    icon: FOLDER_ICON,
    items: [{ name: 'Tic Tac Toe', icon: APP_ICON, href: '/tictactoe' }],
  },
  {
    name: 'Utils',
    icon: FOLDER_ICON,
    items: [
      {
        name: 'Calculator',
        icon: `${PATH}/apps/calculator.png`,
        href: '/calculator',
      },
    ],
  },
];
