import Image from 'next/image';
import { WindowModal as WindowModalType } from '../indexTypes';

type Props = {
  modal: WindowModalType;
  onClose: (uuid: string) => void;
};

export default function WindowModal({ modal, onClose }: Props) {
  if (!modal.isOpen) return null;

  return (
    <div className="h-125 w-165 overflow-hidden rounded-t-lg border border-[#0831d9] bg-white shadow-2xl">
      {/* XP Luna title bar */}
      <div className="flex h-7.5 items-center rounded-t-[7px] border-b border-b-[#0831d9] bg-[linear-gradient(to_bottom,#0997ff_0%,#0053ee_8%,#0050ee_40%,#0060ff_88%,#0060ff_93%,#0855dd_95%,#0855dd_96%,#003bbb_100%)] pr-1 pl-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
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
          <div className="flex flex-row">
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
          className="flex h-full cursor-pointer flex-row items-center pr-1.5 text-xs text-black"
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

        <div className="group ml-3 flex h-full items-center border-[#e0ded3] hover:border active:bg-[#dedede]">
          <Image
            alt=""
            src={'/images/index-page/folder/magnifying-glass.png'}
            width={32}
            height={32}
            className="group-active:h-7 group-active:w-7"
          />
          <p className="ml-2 text-xs text-black">Search</p>
        </div>
        <div className="group ml-3 flex items-center border-r border-[#e0ded3] border-r-[#e0ded3] hover:border active:bg-[#dedede]">
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
        <p className="ml-2 text-xs text-[#797a72]">Address</p>
        <div className="ml-2 flex w-4/5 flex-row items-center justify-between border border-[#919b9f] bg-white">
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
        <div className="group ml-3 flex cursor-default flex-row items-center">
          <Image
            alt=""
            src={'/images/index-page/folder/arrow-right.png'}
            width={16}
            height={16}
            className="group-hover:brightness-110"
          />
          <p className="ml-1 text-xs text-black">Go</p>
        </div>
      </div>
    </div>
  );
}
