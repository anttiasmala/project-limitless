import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { ICONS, notFoundMessage, PATH, SUB_MENUS } from './menuData';

export default function StartMenu({
  onOpenError,
  ref,
  onClose,
}: {
  // Opens a message box. Every entry here is a placeholder, so this is the
  // only thing the menu can currently do.
  onOpenError: (title: string, message: string) => void;
  ref?: React.Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  // The chain of open windows, outermost first: index 0 is opened from the
  // start menu itself, index 1 from an entry inside that window, and so on.
  // Each holds a key of SUB_MENUS and where to draw it, in viewport coords.
  // Fixed positioning lets the windows escape the menu's `overflow-hidden`.
  const [subMenus, setSubMenus] = useState<
    {
      name: string;
      left: number;
      top?: number;
      bottom?: number;
      growUp: boolean;
    }[]
  >([]);
  // Delays closing so the pointer can travel from the item into the window
  // without it flickering shut in between.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opens `name` at depth `level`, discarding any windows already open at
  // that depth or deeper. `growUp` determines if growth of the window should go upwards.
  // "All Programs" does grow upwards in Windows XP.
  // Anchoring via CSS `bottom` keeps that correct no matter how many entries
  // the window has.
  const openSubMenu = (
    e: React.MouseEvent<HTMLElement>,
    name: string,
    level: number,
    growUp: boolean,
  ) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setSubMenus((prev) => [
      ...prev.slice(0, level),
      {
        name,
        growUp,
        left: rect.right,
        ...(growUp
          ? { bottom: window.innerHeight - rect.bottom }
          : { top: rect.top }),
      },
    ]);
  };

  // Closes everything from `level` down, e.g. when the pointer moves onto a
  // plain entry that has no window of its own.
  const closeSubMenusFrom = (level: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSubMenus((prev) => prev.slice(0, level));
  };

  const scheduleCloseSubMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSubMenus([]), 120);
  };

  const keepSubMenuOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  // Returns true if level `level` has an open submenu named `name`
  // e.g. "All Programs" is open at level 0, "Games" at level 1, etc.
  const isOpenParent = (level: number, name: string) =>
    subMenus[level]?.name === name;

  return (
    <div
      ref={ref}
      className="absolute bottom-8 flex h-86 w-80 flex-col overflow-hidden rounded-md border border-[#2a64dd] shadow-[2px_2px_8px_rgba(0,0,0,0.4)] sm:h-125 sm:w-100"
    >
      <div className="relative h-16 shrink-0 rounded-t-md border-b-2 border-b-[#e78e33] bg-[linear-gradient(to_bottom,#4d9bf5_0%,#3f8df5_18%,#2f6fd8_55%,#2a64dd_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <div className="absolute top-2 left-2 flex items-center">
          <Image
            className="size-12 border border-[#dedede]"
            alt="Profile Picture"
            src={'/images/index-page/start-menu/duck.png'}
            width={48}
            height={48}
          />
          <p className="ml-2 text-lg font-bold text-white">User</p>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 bg-white">
        <div className="flex flex-[1.2] flex-col justify-between border-r border-[#aec9ed] bg-white text-black">
          <div className="w-full">
            <button
              onClick={() => {
                onOpenError(
                  'Internet Explorer',
                  notFoundMessage('iexplore.exe'),
                );
                onClose();
              }}
              className="relative mt-1 mr-1 ml-1 flex w-full cursor-pointer items-center hover:bg-[#2f71cd] hover:text-white"
            >
              <Image
                alt="Internet Explorer icon"
                src={`${PATH}/internet-explorer.png`}
                width={32}
                height={32}
              />
              <p className="ml-1 text-xs">Internet Explorer</p>
            </button>
            <div className="my-2 h-px w-full bg-[linear-gradient(to_right,transparent,#9aa8be_50%,transparent)]" />
            <Link
              href={'/calculator'}
              target="_blank"
              className="relative mt-2 mr-1 ml-1 flex cursor-pointer items-center hover:bg-[#2f71cd] hover:text-white"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="text-2xl leading-none">🧮</span>
                <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white text-[8px] leading-none text-blue-700 shadow ring-1 ring-blue-400">
                  ↗
                </span>
              </span>
              <p className="ml-1 text-xs">Calculator</p>
            </Link>
            <Link
              href={'/tictactoe'}
              target="_blank"
              className="relative mt-2 mr-1 ml-1 flex cursor-pointer items-center hover:bg-[#2f71cd] hover:text-white"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="text-2xl leading-none">🖥️</span>
                <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white text-[8px] leading-none text-blue-700 shadow ring-1 ring-blue-400">
                  ↗
                </span>
              </span>
              <p className="ml-1 text-xs">Tic-tac-toe</p>
            </Link>
          </div>
          <div>
            <div className="h-px w-full bg-[linear-gradient(to_right,transparent,#9aa8be_50%,transparent)]" />
            <div
              className={`relative m-2 flex items-center justify-center gap-1 pt-1 pr-2 pb-1 font-bold select-none hover:bg-[#2f71cd] hover:text-white ${
                isOpenParent(0, 'All Programs') ? 'bg-[#2f71cd] text-white' : ''
              }`}
              onMouseEnter={(e) => openSubMenu(e, 'All Programs', 0, true)}
              onMouseLeave={scheduleCloseSubMenu}
            >
              <p className="flex items-center text-xs font-semibold">
                All Programs
              </p>
              <Image
                className="absolute right-4 sm:right-7"
                alt="All programs icon"
                src={`${PATH}/all-programs.ico`}
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#d3e5fa] pb-2 text-black">
          {ICONS.map((icon, i) => {
            if (icon.isSeparator) {
              return (
                <div
                  key={icon.text + i}
                  className="mx-3 mt-2 border-b border-[#9db8e0]"
                ></div>
              );
            }
            const isSubMenu = icon.isSubMenu ?? false;
            return (
              <div
                className={`mt-2 w-full cursor-pointer pl-2 hover:bg-[#2f71cd] hover:text-white ${
                  isSubMenu && isOpenParent(0, icon.text)
                    ? 'bg-[#2f71cd] text-white'
                    : ''
                }`}
                key={icon.text + i}
                onMouseEnter={
                  isSubMenu
                    ? (e) => openSubMenu(e, icon.text, 0, false)
                    : scheduleCloseSubMenu
                }
                onMouseLeave={isSubMenu ? scheduleCloseSubMenu : undefined}
              >
                <Button
                  text={icon.text}
                  icon={icon.icon}
                  isSubMenu={isSubMenu}
                  onClick={() => {
                    // Submenu parents (e.g. My Recent Documents) reveal their
                    // flyout on hover and do nothing on click, like Windows XP.
                    if (isSubMenu) return;
                    onOpenError(icon.text, notFoundMessage(icon.text));
                    onClose();
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex h-12 w-full shrink-0 justify-end rounded-b-md border-t-2 border-t-[#e78e33] bg-[linear-gradient(to_bottom,#4d9bf5_0%,#3f8df5_18%,#2f6fd8_55%,#2a64dd_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <div className="pt-2 pr-2">
          <button className="flex cursor-pointer items-center text-xs hover:brightness-110">
            <Image
              alt="Logout button"
              src={`${PATH}/logout.png`}
              width={32}
              height={32}
            />
            <p className="pl-1">
              <span className="underline">L</span>og Off
            </p>
          </button>
        </div>
        <div className="pt-2 pr-2">
          <button className="flex cursor-pointer items-center text-xs hover:brightness-110">
            <Image
              alt="Logout button"
              src={`${PATH}/shutdown.png`}
              width={32}
              height={32}
            />
            <p className="pl-1">Turn Off Computer</p>
          </button>
        </div>
      </div>

      {subMenus.map((menu, level) => (
        <div
          key={level}
          onMouseEnter={keepSubMenuOpen}
          onMouseLeave={scheduleCloseSubMenu}
          style={{
            top: menu.top,
            bottom: menu.bottom,
            left: menu.left,
          }}
          className="fixed z-50 flex min-w-40 flex-col border border-l-4 border-[#2a64dd] bg-white py-1 shadow-[2px_2px_8px_rgba(0,0,0,0.4)]"
        >
          {SUB_MENUS[menu.name]?.length ? (
            SUB_MENUS[menu.name].map((entry) => {
              const isActive =
                (entry.isSubMenu ?? false) &&
                isOpenParent(level + 1, entry.text);
              return (
                <button
                  key={entry.text}
                  onMouseEnter={
                    entry.isSubMenu
                      ? (e) =>
                          openSubMenu(e, entry.text, level + 1, menu.growUp)
                      : () => closeSubMenusFrom(level + 1)
                  }
                  onClick={() => {
                    // Like the start menu itself, a window that has its own
                    // window opens it on hover and ignores clicks.
                    if (entry.isSubMenu) return;
                    if (entry.href) {
                      window.open(entry.href, '_blank');
                      return;
                    }
                    onOpenError(entry.text, notFoundMessage(entry.text));
                    onClose();
                  }}
                  className={`group flex w-full cursor-pointer items-center gap-2 px-3 py-0.5 text-left hover:bg-[#1b65cc] hover:text-white ${
                    isActive ? 'bg-[#1b65cc] text-white' : ''
                  }`}
                >
                  {entry.icon ? (
                    <Image
                      alt={`${entry.text} icon`}
                      src={entry.icon}
                      width={16}
                      height={16}
                    />
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}
                  <p
                    className={`flex items-center text-xs select-none group-hover:text-white ${
                      isActive ? 'text-white' : 'text-black'
                    }`}
                  >
                    {entry.text}
                    {entry.isSubMenu && (
                      <span className="ml-1.5 h-0 w-0 border-y-3 border-l-[3px] border-y-transparent border-l-current" />
                    )}
                    {entry.href && (
                      <span style={{ fontSize: '0.6rem' }}>↗</span>
                    )}
                  </p>
                </button>
              );
            })
          ) : (
            <button
              onClick={() => {
                onOpenError('Error', 'This submenu is empty.');
                onClose();
              }}
              className="group w-full cursor-pointer px-3 py-0.5 text-left hover:bg-[#1b65cc] hover:text-white"
            >
              <p className="text-xs text-[#6d6d6d] select-none group-hover:text-white">
                (Empty)
              </p>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

type ButtonProps = Partial<HTMLButtonElement> & {
  text: string;
  icon: string;
  isSubMenu: boolean;
  onClick: () => void;
};

function Button({ text, icon, isSubMenu, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="flex w-full cursor-pointer">
      <Image alt={`${text} icon`} src={icon} width={24} height={24} />
      <p className="flex items-center pl-2 text-xs">
        {text}
        {isSubMenu && (
          <span className="ml-1.5 h-0 w-0 border-y-[3px] border-l-4 border-y-transparent border-l-current" />
        )}
      </p>
    </button>
  );
}
