import { Folder } from '../../indexTypes';
import type { ContextMenuItem } from './DesktopContextMenu';

// Actions shared by the menu builders. `menuError` returns the placeholder
// handler for entries that aren't wired to real behavior yet.
type MenuError = (name: string) => () => void;

type DesktopMenuActions = {
  menuError: MenuError;
  clearDesktop: () => void;
};

type FolderMenuActions = {
  menuError: MenuError;
  openFolder: (folder: Folder) => void;
};

// The classic Windows XP desktop right-click menu. Only "Refresh" does real
// work (clears the icon/window selection); everything else is a placeholder.
export function buildDesktopMenu({
  menuError,
  clearDesktop,
}: DesktopMenuActions): ContextMenuItem[] {
  return [
    {
      label: 'Arrange Icons By',
      submenu: [
        { label: 'Name', onSelect: menuError('Name') },
        { label: 'Size', onSelect: menuError('Size') },
        { label: 'Type', onSelect: menuError('Type') },
        { label: 'Modified', onSelect: menuError('Modified') },
        { separator: true },
        { label: 'Show in Groups', onSelect: menuError('Show in Groups') },
        { label: 'Auto Arrange', onSelect: menuError('Auto Arrange') },
        { label: 'Align to Grid', onSelect: menuError('Align to Grid') },
        { separator: true },
        {
          label: 'Show Desktop Icons',
          onSelect: menuError('Show Desktop Icons'),
        },
      ],
    },
    { label: 'Refresh', onSelect: clearDesktop },
    { separator: true },
    { label: 'Paste', disabled: true },
    { label: 'Paste Shortcut', disabled: true },
    { separator: true },
    {
      label: 'New',
      submenu: [
        { label: 'Folder', onSelect: menuError('Folder') },
        { label: 'Shortcut', onSelect: menuError('Shortcut') },
        { separator: true },
        { label: 'Text Document', onSelect: menuError('Text Document') },
        { label: 'Bitmap Image', onSelect: menuError('Bitmap Image') },
      ],
    },
    { separator: true },
    { label: 'Properties', onSelect: menuError('Display Properties') },
  ];
}

// The right-click menu for a single desktop folder icon. "Open" launches the
// folder; the rest are placeholders.
export function buildFolderMenu(
  folder: Folder,
  { menuError, openFolder }: FolderMenuActions,
): ContextMenuItem[] {
  return [
    {
      label: `Open ${folder.name}`,
      bold: true,
      onSelect: () => openFolder(folder),
    },
    { label: 'Explore', onSelect: menuError('Explore') },
    { separator: true },
    { label: 'Cut', onSelect: menuError('Cut') },
    { label: 'Copy', onSelect: menuError('Copy') },
    { separator: true },
    {
      label: 'Create Shortcut',
      onSelect: menuError('Create Shortcut'),
    },
    { label: 'Delete', onSelect: menuError('Delete') },
    { label: 'Rename', onSelect: menuError('Rename') },
    { separator: true },
    { label: 'Properties', onSelect: menuError('Properties') },
  ];
}

export function buildNotepadMenu(
  name: string,
  { menuError, openNotepad }: { menuError: MenuError; openNotepad: () => void },
) {
  return [
    {
      label: `Open ${name}`,
      bold: true,
      onSelect: () => openNotepad(),
    },
    { label: 'Explore', onSelect: menuError('Explore') },
    { separator: true },
    { label: 'Cut', onSelect: menuError('Cut') },
    { label: 'Copy', onSelect: menuError('Copy') },
    { separator: true },
    {
      label: 'Create Shortcut',
      onSelect: menuError('Create Shortcut'),
    },
    { label: 'Delete', onSelect: menuError('Delete') },
    { label: 'Rename', onSelect: menuError('Rename') },
    { separator: true },
    { label: 'Properties', onSelect: menuError('Properties') },
  ];
}
