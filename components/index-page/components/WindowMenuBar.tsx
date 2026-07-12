import { useEffect, useRef, useState } from 'react';

type Props = {
  // Called when the "Close" item in the File menu is chosen.
  onClose: () => void;
};

// A single entry in a dropdown menu. A separator draws a divider line; an item
// is a clickable row. Only items with `onSelect` do anything — every other item
// is rendered greyed-out, matching XP's File menu with nothing selected (the
// file operations have no target, so they are disabled).
type MenuEntry =
  | { type: 'separator' }
  | {
      type: 'item';
      label: string;
      // A ▶ arrow is drawn for items that would open a submenu in real XP.
      submenu?: boolean;
      // Present only on functional items; its absence renders the row disabled.
      onSelect?: () => void;
    };

// Authentic Windows XP Explorer menus. Everything except File → Close is a
// faithful placeholder: shown, but disabled, so the bar looks complete without
// implementing a real file system behind it.
const MENUS = (
  onClose: () => void,
): { name: string; entries: MenuEntry[] }[] => [
  {
    name: 'File',
    entries: [
      { type: 'item', label: 'New' },
      { type: 'item', label: 'Create Shortcut' },
      { type: 'item', label: 'Delete' },
      { type: 'item', label: 'Rename' },
      { type: 'item', label: 'Properties' },
      { type: 'separator' },
      { type: 'item', label: 'Close', onSelect: onClose },
    ],
  },
  {
    name: 'Edit',
    entries: [
      { type: 'item', label: 'Undo' },
      { type: 'separator' },
      { type: 'item', label: 'Cut' },
      { type: 'item', label: 'Copy' },
      { type: 'item', label: 'Paste' },
      { type: 'item', label: 'Paste Shortcut' },
      { type: 'separator' },
      { type: 'item', label: 'Copy To Folder...' },
      { type: 'item', label: 'Move To Folder...' },
      { type: 'separator' },
      { type: 'item', label: 'Select All' },
      { type: 'item', label: 'Invert Selection' },
    ],
  },
  {
    name: 'View',
    entries: [
      { type: 'item', label: 'Toolbars' },
      { type: 'item', label: 'Status Bar' },
      { type: 'item', label: 'Explorer Bar' },
      { type: 'separator' },
      { type: 'item', label: 'Thumbnails' },
      { type: 'item', label: 'Tiles' },
      { type: 'item', label: 'Icons' },
      { type: 'item', label: 'List' },
      { type: 'item', label: 'Details' },
      { type: 'separator' },
      { type: 'item', label: 'Arrange Icons by' },
      { type: 'item', label: 'Choose Details...' },
      { type: 'separator' },
      { type: 'item', label: 'Go To' },
      { type: 'item', label: 'Refresh' },
    ],
  },
  {
    name: 'Favorites',
    entries: [
      { type: 'item', label: 'Add to Favorites...' },
      { type: 'item', label: 'Organize Favorites...' },
      { type: 'separator' },
      { type: 'item', label: 'Links' },
    ],
  },
  {
    name: 'Tools',
    entries: [
      { type: 'item', label: 'Map Network Drive...' },
      { type: 'item', label: 'Disconnect Network Drive...' },
      { type: 'item', label: 'Synchronize...' },
      { type: 'separator' },
      { type: 'item', label: 'Folder Options...' },
    ],
  },
  {
    name: 'Help',
    entries: [
      { type: 'item', label: 'Help and Support Center' },
      { type: 'separator' },
      { type: 'item', label: 'Is this copy of Windows legal?' },
      { type: 'item', label: 'About Windows' },
    ],
  },
];

export default function WindowMenuBar({ onClose }: Props) {
  // The name of the menu whose dropdown is open, or null when all are closed.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const menus = MENUS(onClose);

  // Close the open menu on a click anywhere outside the bar, or on Escape —
  // exactly how a menu dismisses in Windows. Only wired up while one is open.
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  return (
    <div ref={barRef} className="flex flex-row select-none">
      {menus.map((menu) => {
        const isOpen = openMenu === menu.name;
        return (
          <div key={menu.name} className="relative">
            <button
              type="button"
              // Click toggles this menu; once any menu is open, moving the
              // cursor onto another top-level name switches to it (XP behaviour).
              onClick={() => setOpenMenu(isOpen ? null : menu.name)}
              onMouseEnter={() =>
                setOpenMenu((prev) => (prev ? menu.name : prev))
              }
              className={`cursor-default px-2 py-1 ${
                isOpen
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-500 hover:text-white'
              }`}
            >
              {menu.name}
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 z-50 min-w-44 border border-[#aca899] bg-[#f0efe7] py-0.5 shadow-[2px_2px_3px_rgba(0,0,0,0.35)]">
                {menu.entries.map((entry, i) =>
                  entry.type === 'separator' ? (
                    <div key={i} className="my-0.5 h-px bg-[#aca899]" />
                  ) : entry.onSelect ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        entry.onSelect?.();
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-6 py-0.5 text-left hover:bg-[#316ac5] hover:text-white"
                    >
                      <span>{entry.label}</span>
                      {entry.submenu && <span className="ml-4">▶</span>}
                    </button>
                  ) : (
                    // Disabled placeholder: no action, greyed, no hover.
                    <div
                      key={i}
                      className="flex cursor-default items-center justify-between px-6 py-0.5 text-[#aca899]"
                    >
                      <span>{entry.label}</span>
                      {entry.submenu && <span className="ml-4">▶</span>}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
