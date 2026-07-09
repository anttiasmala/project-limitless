import Image from 'next/image';
import { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

// A collapsible XP "webview" panel: light header bar + gradient body.
export default function SidebarPanel({ title, children }: Props) {
  return (
    <div className="overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between bg-[linear-gradient(to_right,#f4f8ff,#c5d6f5)] px-2 py-1">
        <span className="text-[11px] font-bold text-[#15428b] select-none">
          {title}
        </span>
        <span className="group flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(to_bottom,#a7c1ee,#5b7fd6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <Image
            alt=""
            src="/images/index-page/folder/double-arrow-up.png"
            width={32}
            height={32}
            className="group-hover:brightness-110"
          />
        </span>
      </div>
      <div className="bg-[linear-gradient(to_bottom,#ffffff,#c5d7f4)] px-2.5 py-2">
        {children}
      </div>
    </div>
  );
}
