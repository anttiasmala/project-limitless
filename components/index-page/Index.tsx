'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../shared/Button';

export default function Index() {
  const [time, setTime] = useState('');

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
            onDoubleClick={() => console.log('Double Click')}
          >
            <Image
              alt="Folder icon"
              src={'/images/index-page/folder-icon.png'}
              width={32}
              height={32}
              className="group-focus:opacity-50"
            />
            <span className="group-focus:bg-[#0b61ff] group-focus:opacity-100">
              Games
            </span>
          </Button>
        </div>
      </div>

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
