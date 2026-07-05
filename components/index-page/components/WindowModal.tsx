import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { WindowModal as WindowModalType } from '../indexTypes';
import SidebarItem from './SidebarItem';
import SidebarPanel from './SidebarPanel';

type Props = {
  modal: WindowModalType;
  onClose: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onMove: (uuid: string, top: number, left: number) => void;
};

// Placeholder icon used until real per-item icons are added.
const PLACEHOLDER = '/images/index-page/folder/folder-opened-icon.png';
const PATH = '/images/index-page/folder';

const fileTasks = [
  { icon: `${PATH}/make-a-new-folder.png`, label: 'Make a new folder' },
  {
    icon: `${PATH}/publish-this-folder-to-the-web.png`,
    label: 'Publish this folder to the Web',
  },
  {
    icon: `${PATH}/share-this-folder.png`,
    label: 'Share this folder',
  },
];

const otherPlaces = [
  { icon: PLACEHOLDER, label: 'Documents and Settings' },
  { icon: `${PATH}/my-documents.png`, label: 'My Documents' },
  { icon: PLACEHOLDER, label: 'Shared Documents' },
  { icon: `${PATH}/my-computer.png`, label: 'My Computer' },
  { icon: `${PATH}/my-network-places.png`, label: 'My Network Places' },
];

export default function WindowModal({
  modal,
  onClose,
  onFocus,
  onMove,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  if (!modal.isOpen) return null;

  // Drag the window by its title bar. Position is tracked directly on the DOM
  // node while dragging for smoothness, then committed to state on release.
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left button only
    const div = rootRef.current;
    if (!div) return;
    e.preventDefault(); // avoid selecting the title text while dragging

    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = div.offsetTop;
    const startLeft = div.offsetLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const maxLeft = document.documentElement.clientWidth - div.offsetWidth;
      const maxTop = document.documentElement.clientHeight - div.offsetHeight;

      const nextLeft = startLeft + (moveEvent.clientX - startX);
      const nextTop = startTop + (moveEvent.clientY - startY);

      div.style.left = `${Math.max(0, Math.min(nextLeft, maxLeft))}px`;
      div.style.top = `${Math.max(0, Math.min(nextTop, maxTop - 35))}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onMove(modal.uuid, div.offsetTop, div.offsetLeft);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={rootRef}
      onMouseDown={() => onFocus(modal.uuid)}
      style={{ zIndex: modal.zIndex, top: modal.top, left: modal.left }}
      className="absolute flex h-125 w-165 flex-col overflow-hidden rounded-t-lg border border-[#0831d9] bg-white shadow-2xl"
    >
      {/* XP Luna title bar */}
      <div
        onMouseDown={handleDragStart}
        className="flex h-7.5 cursor-move items-center rounded-t-[7px] border-b border-b-[#0831d9] bg-[linear-gradient(to_bottom,#0997ff_0%,#0053ee_8%,#0050ee_40%,#0060ff_88%,#0060ff_93%,#0855dd_95%,#0855dd_96%,#003bbb_100%)] pr-1 pl-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        <Image
          alt=""
          src={modal.modalIcon}
          width={16}
          height={16}
          className="shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
        />
        <p className="mt-1 ml-1.5 truncate text-sm font-bold text-white select-none [text-shadow:1px_1px_1px_rgba(0,0,0,0.6)]">
          {modal.modalName}
        </p>

        {/* Window controls */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Minimize */}
          <button
            type="button"
            aria-label="Minimize"
            className="relative flex h-5.25 w-5.25 items-center justify-center rounded-[3px] border border-white/80 bg-[linear-gradient(to_bottom,#3f8df5_0%,#0e5ce6_45%,#0a4bce_50%,#1560e6_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90"
          >
            <span className="mt-2 h-0.75 w-2.25 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
          </button>

          {/* Maximize */}
          <button
            type="button"
            aria-label="Maximize"
            className="flex h-5.25 w-5.25 items-center justify-center rounded-[3px] border border-white/80 bg-[linear-gradient(to_bottom,#3f8df5_0%,#0e5ce6_45%,#0a4bce_50%,#1560e6_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90"
          >
            <span className="h-2.5 w-2.75 rounded-[1px] border-2 border-t-[3px] border-white bg-transparent shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
          </button>

          {/* Close */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => onClose(modal.uuid)}
            className="relative flex h-5.25 w-5.25 items-center justify-center rounded-[3px] border border-white/80 bg-[linear-gradient(to_bottom,#f7a17d_0%,#e04a2b_45%,#c62d15_50%,#e35a37_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90"
          >
            <span className="absolute h-0.5 w-3 rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
            <span className="absolute h-0.5 w-3 -rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
          </button>
        </div>
      </div>
      <div className="w-full bg-[#f0efe7] text-black">
        <div className="flex flex-row justify-between text-xs">
          <div className="flex flex-row select-none">
            <p className="ml-1 p-1 hover:bg-blue-500 hover:text-white">File</p>
            <p className="ml-3 p-1 hover:bg-blue-500 hover:text-white">Edit</p>
            <p className="ml-3 p-1 hover:bg-blue-500 hover:text-white">View</p>
            <p className="ml-3 p-1 hover:bg-blue-500 hover:text-white">
              Favorites
            </p>
            <p className="ml-3 p-1 hover:bg-blue-500 hover:text-white">Tools</p>
            <p className="ml-3 p-1 hover:bg-blue-500 hover:text-white">Help</p>
          </div>
          <Image
            alt=""
            src={'/images/index-page/folder/windows-logo.png'}
            width={40}
            height={24}
            className="self-center border-l border-l-[#e0ded3]"
          />
        </div>
      </div>

      <div className="flex h-12 w-full flex-row border-t border-[#e0ded3] bg-[#f0efe7]">
        <button
          className="flex h-full cursor-pointer flex-row items-center pr-1.5 text-xs text-black hover:brightness-110"
          onClick={() => onClose(modal.uuid)}
        >
          <Image
            alt=""
            src={'/images/index-page/folder/go-back.png'}
            width={32}
            height={32}
          />
          <p>Back</p>
          <span className="ml-1.5 h-0 w-0 border-x-[3px] border-t-4 border-x-transparent border-t-black" />
        </button>
        <div className="flex h-full items-center">
          <Image
            alt=""
            src={'/images/index-page/folder/go-forward.png'}
            width={32}
            height={32}
            className="opacity-50"
          />
          <span className="ml-1.5 h-0 w-0 border-x-[3px] border-t-4 border-x-transparent border-t-black" />
        </div>
        <div className="ml-3 flex items-center border-r border-r-[#e0ded3]">
          <Image
            alt=""
            src={'/images/index-page/folder/folder-and-uparrow.png'}
            width={32}
            height={32}
            className="mr-2 border-[#e0ded3] hover:border active:h-7 active:w-7 active:bg-[#dedede]"
          />
        </div>

        <div className="group ml-3 flex h-full cursor-default items-center border-[#e0ded3] hover:border active:bg-[#dedede]">
          <Image
            alt=""
            src={'/images/index-page/folder/magnifying-glass.png'}
            width={32}
            height={32}
            className="group-active:h-7 group-active:w-7"
          />
          <p className="ml-2 text-xs text-black">Search</p>
        </div>
        <div className="group ml-3 flex cursor-default items-center border-r border-[#e0ded3] border-r-[#e0ded3] hover:border active:bg-[#dedede]">
          <Image
            alt=""
            src={'/images/index-page/folder/open-folder-big.png'}
            width={32}
            height={32}
            className="group-active:h-7 group-active:w-7"
          />
          <p className="mr-3 ml-1 text-xs text-black">Folders</p>
        </div>
        <div className="group ml-3 flex items-center border-[#e0ded3] pr-2 pl-2 hover:border active:bg-[#dedede]">
          <Image
            alt=""
            src={'/images/index-page/folder/folder-and-calendar.png'}
            width={32}
            height={32}
            className="group-active:h-7 group-active:w-7"
          />
          <span className="ml-1.5 h-0 w-0 border-x-[3px] border-t-4 border-x-transparent border-t-black" />
        </div>
      </div>
      <div className="flex w-full flex-row bg-[#f0efe7]">
        <p className="ml-2 text-xs text-[#797a72] select-none">Address</p>
        <div className="ml-2 flex w-5/6 flex-row items-center justify-between border border-[#919b9f] bg-white">
          <div className="flex flex-row">
            <Image
              alt=""
              src={'/images/index-page/folder/folder-opened-icon.png'}
              width={16}
              height={16}
              className="ml-1 self-center"
            />
            <p className="mt-0.5 ml-1 text-xs text-black">
              C:\Desktop\{modal.modalName}
            </p>
          </div>
          <div className="flex flex-col text-black">
            <Image
              alt=""
              src={'/images/index-page/folder/arrow-down.png'}
              width={15}
              height={15}
              className="h-3.75 w-3.75 hover:brightness-110"
            />
          </div>
        </div>
        <div className="group ml-1 flex cursor-default flex-row items-center">
          <Image
            alt=""
            src={'/images/index-page/folder/arrow-right.png'}
            width={16}
            height={16}
            className="group-hover:brightness-110 group-active:h-3.5 group-active:w-3.5"
          />
          <p className="ml-1 text-xs text-black">Go</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 text-black">
        {/* Left task pane */}
        <aside className="w-52 shrink-0 space-y-3.5 overflow-y-auto bg-[linear-gradient(to_bottom,#7ba0f0_0%,#4062c8_100%)] px-2.5 py-3.5">
          <SidebarPanel title="File and Folder Tasks">
            {fileTasks.map((task) => (
              <SidebarItem
                key={task.label}
                icon={task.icon}
                label={task.label}
              />
            ))}
          </SidebarPanel>

          <SidebarPanel title="Other Places">
            {otherPlaces.map((place) => (
              <SidebarItem
                key={place.label}
                icon={place.icon}
                label={place.label}
              />
            ))}
          </SidebarPanel>

          <SidebarPanel title="Details">
            <span className="text-[11px] text-[#0c327d]">
              {modal.modalName}
            </span>
          </SidebarPanel>
        </aside>

        {/* Folder contents */}
        <section className="grid flex-1 grid-cols-2 content-start gap-x-2 gap-y-3 overflow-y-auto bg-white p-4">
          {modal.items.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group flex items-center gap-2 rounded p-1 text-left"
              target="_blank"
            >
              <Image
                alt=""
                src={app.icon}
                width={40}
                height={40}
                className="shrink-0"
              />
              <span className="rounded-sm px-0.5 text-xs group-hover:bg-[#316ac5] group-hover:text-white">
                {app.name}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
