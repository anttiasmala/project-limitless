'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../shared/Button';
import { WindowModal } from './indexTypes';

export default function Index() {
  const [time, setTime] = useState('');
  const [windowModal, setWindowModal] = useState<WindowModal[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const dateTime = new Date();
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      setTime(`${dateTime.getHours()}:${minutes}`);
    };
    const timeout = setTimeout(updateTime, 0);
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 bg-[url(/images/index-page/background.jpeg)] bg-cover px-4">
      {/* Back to the arcade landing page */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-white"
      >
        ← Home
      </Link>

      <div className="absolute top-20 left-10">
        <div>
          <Button
            variant="unstyled"
            className="group flex cursor-default flex-col"
            onDoubleClick={() =>
              setWindowModal((prevValue) => {
                return [
                  ...prevValue,
                  {
                    uuid: crypto.randomUUID(),
                    isOpen: true,
                    modalIcon: '/images/index-page/folder-opened-icon.png',
                    modalName: 'Folder',
                    zIndex: '1',
                  },
                ];
              })
            }
          >
            <Image
              alt="Folder icon"
              src={'/images/index-page/folder-icon.png'}
              width={32}
              height={32}
              className="group-focus:opacity-50"
            />
            <span className="text-sm group-focus:bg-[#0b61ff] group-focus:opacity-100">
              Games
            </span>
          </Button>
        </div>
      </div>

      {windowModal[0] && (
        <div className="h-125 w-165 overflow-hidden rounded-t-lg border border-[#0831d9] bg-white shadow-2xl">
          {/* XP Luna title bar */}
          <div className="flex h-7.5 items-center rounded-t-[7px] border-b border-b-[#0831d9] bg-[linear-gradient(to_bottom,#0997ff_0%,#0053ee_8%,#0050ee_40%,#0060ff_88%,#0060ff_93%,#0855dd_95%,#0855dd_96%,#003bbb_100%)] pr-1 pl-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Image
              alt=""
              src={windowModal[0].modalIcon}
              width={16}
              height={16}
              className="shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
            <p className="ml-1.5 truncate text-sm font-bold text-white select-none [text-shadow:1px_1px_1px_rgba(0,0,0,0.6)]">
              {windowModal[0].modalName}
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
                onClick={() => setWindowModal([])}
                className="relative flex h-5.25 w-5.25 items-center justify-center rounded-[3px] border border-white/80 bg-[linear-gradient(to_bottom,#f7a17d_0%,#e04a2b_45%,#c62d15_50%,#e35a37_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] hover:brightness-110 active:brightness-90"
              >
                <span className="absolute h-0.5 w-3 rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
                <span className="absolute h-0.5 w-3 -rotate-45 rounded-[1px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)]" />
              </button>
            </div>
          </div>
          <div className="w-full bg-[#f0efe7] font-black">a</div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full border-t border-t-[#0831d9] bg-[linear-gradient(to_bottom,#1f6dd6_0%,#3f8df5_3%,#2a64dd_6%,#235dd9_10%,#225ad4_55%,#1c4fc4_90%,#1c4fc4_95%,#3068dd_100%)]">
        <Image
          alt="Start button"
          src={'/images/index-page/start-button.png'}
          width={106}
          height={34}
          loading="eager"
        />
        <div className="absolute right-0 bottom-0 flex h-full w-24 flex-row border-l border-l-[#0c3aa5] bg-[linear-gradient(to_bottom,#14a5f0_0%,#128ee8_50%,#0e7ad9_100%)] shadow-[inset_1px_0_0_#3a9ff5]">
          <div className="flex h-full w-full items-center">
            <div className="ml-3">
              <Image
                alt="Sound icon"
                src={'/images/index-page/sound.png'}
                height={16}
                width={16}
              />
            </div>
            <Image
              alt="Shield icon"
              src={'/images/index-page/1shield.png'}
              height={16}
              width={16}
            />
            <p className="ml-2 text-sm select-none">{time}</p>
          </div>
        </div>
      </footer>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl dark:text-slate-100"></h1>
      </div>
    </main>
  );
}
