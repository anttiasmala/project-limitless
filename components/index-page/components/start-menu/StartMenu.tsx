import Image from 'next/image';
import Link from 'next/link';

const PATH = '/images/index-page/start-menu';

const ICONS: {
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

export default function StartMenu({
  ref,
}: {
  ref?: React.Ref<HTMLDivElement>;
}) {
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
            <div className="relative mt-1 mr-1 ml-1 flex cursor-pointer items-center hover:bg-[#2f71cd] hover:text-white">
              <Image
                alt="Internet Explorer icon"
                src={`${PATH}/internet-explorer.png`}
                width={32}
                height={32}
              />
              <p className="ml-1 text-xs">Internet Explorer</p>
            </div>
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
            <div className="relative m-2 flex items-center justify-center gap-1 pt-1 pr-2 pb-1 font-bold select-none hover:bg-[#2f71cd] hover:text-white">
              <p className="text-xs font-semibold">All Programs</p>
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
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#d3e5fa] pb-2 text-black">
          {ICONS.map((icon, i) => {
            if (icon.isSeparator) {
              return (
                <div
                  key={icon.text + i}
                  className="mx-3 mt-2 border-b border-[#9db8e0]"
                ></div>
              );
            }
            return (
              <div
                className="mt-2 w-full cursor-pointer pl-2 hover:bg-[#2f71cd] hover:text-white"
                key={icon.text + i}
              >
                <Button
                  text={icon.text}
                  icon={icon.icon}
                  isSubMenu={icon.isSubMenu ?? false}
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
    </div>
  );
}

type ButtonProps = Partial<HTMLButtonElement> & {
  text: string;
  icon: string;
  isSubMenu: boolean;
};

function Button({ text, icon, isSubMenu }: ButtonProps) {
  return (
    <button className="flex cursor-pointer">
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
