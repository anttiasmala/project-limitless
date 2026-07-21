'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// A single row of the menu. A row is either a separator, a regular value, or a
// parent that reveals a flyout submenu on hover. `disabled` greys the row out
// and makes it unclickable, like e.g. XP's Paste when the clipboard is empty.
export type ContextMenuItem = {
  label?: string;
  bold?: boolean;
  separator?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
  onSelect?: () => void;
};

// Keep the menu this far from the viewport edge when clamping, so it never
// opens window against the side of the screen.
const EDGE_MARGIN = 4;

export default function DesktopContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  // Cursor position (viewport coordinates) the menu should open at.
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  // Where the menu is actually drawn: starts at the cursor, then gets nudged
  // back on-screen once we can measure it.
  const [pos, setPos] = useState({ left: x, top: y });
  // Which parent row (by index) currently has its flyout open, and where to
  // draw that flyout in viewport coordinates.
  const [openSub, setOpenSub] = useState<{
    index: number;
    left: number;
    top: number;
  } | null>(null);

  // Clamp the root menu so it stays fully on-screen, flipping to the left/up
  // side of the cursor when there isn't room on the right/below.
  const measureRef = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      let left = x;
      let top = y;
      if (left + width > window.innerWidth - EDGE_MARGIN) {
        left = Math.max(EDGE_MARGIN, x - width);
      }
      if (top + height > window.innerHeight - EDGE_MARGIN) {
        top = Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN);
      }
      setPos({ left, top });
    },
    [x, y],
  );

  // Close on outside click, Escape-key press or scroll/resize
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !subRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  const runItem = (item: ContextMenuItem) => {
    if (item.disabled || item.submenu) return;
    item.onSelect?.();
    onClose();
  };

  return (
    <>
      <Menu
        ref={measureRef}
        items={items}
        style={{ left: pos.left, top: pos.top }}
        openIndex={openSub?.index ?? null}
        onItemEnter={(index, rect) => {
          const item = items[index];
          if (item.submenu && !item.disabled) {
            // Grow the flyout to the right of its parent row, or to the left
            // when it would overflow the viewport.
            setOpenSub({ index, left: rect.right, top: rect.top - 3 });
          } else {
            setOpenSub(null);
          }
        }}
        onItemClick={runItem}
      />

      {openSub && items[openSub.index]?.submenu && (
        <Menu
          ref={subRef}
          items={items[openSub.index].submenu!}
          style={{ left: openSub.left, top: openSub.top }}
          openIndex={null}
          // A "grandchild" flyout isn't supported. Hovering rows in here just
          // keeps the parent open.
          onItemEnter={() => {}}
          onItemClick={runItem}
        />
      )}
    </>
  );
}

// One column of rows. Shared by the root menu and each flyout so they look
// identical.
function Menu({
  items,
  style,
  openIndex,
  onItemEnter,
  onItemClick,
  ref,
}: {
  items: ContextMenuItem[];
  style: React.CSSProperties;
  openIndex: number | null;
  onItemEnter: (index: number, rect: DOMRect) => void;
  onItemClick: (item: ContextMenuItem) => void;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      style={style}
      // A right-click inside the menu shouldn't open a second one.
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-45 border border-[#0a246a] bg-[#f1efe2] py-0.5 text-black shadow-[2px_2px_6px_rgba(0,0,0,0.45)] select-none"
    >
      {items.map((item, i) => {
        if (item.separator) {
          return (
            <div
              key={`sep-${i}`}
              className="mx-1 my-1 h-px bg-[#aca899] shadow-[0_1px_0_#ffffff]"
            />
          );
        }
        const isOpen = openIndex === i;
        return (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onMouseEnter={(e) =>
              onItemEnter(i, e.currentTarget.getBoundingClientRect())
            }
            onClick={() => onItemClick(item)}
            className={`flex w-full items-center justify-between gap-6 px-6 py-0.5 text-left text-xs ${
              item.disabled
                ? 'cursor-default text-[#aca899]'
                : `cursor-pointer ${isOpen ? 'bg-[#316ac5] text-white' : 'hover:bg-[#316ac5] hover:text-white'}`
            }`}
          >
            <span className={item.bold ? 'font-bold' : ''}>{item.label}</span>
            {item.submenu && (
              // The ► that marks a row with a sub flyout menu.
              <span className="h-0 w-0 border-y-4 border-l-4 border-y-transparent border-l-current" />
            )}
          </button>
        );
      })}
    </div>
  );
}
