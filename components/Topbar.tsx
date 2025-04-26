import Image from 'next/image';
import { useRouter } from 'next/router';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import SvgWaterDrop from '~/icons/water_drop';

export function Topbar({ className }: HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  return (
    <div
      className={twMerge(
        'relative mt-1 mb-20 flex flex-row justify-center',
        className,
      )}
    >
      <button
        className="relative"
        onClick={() => {
          router.push('/').catch((e) => console.error(e));
        }}
      >
        <SvgWaterDrop width={100} height={100} />
        <span className="absolute -left-13 w-max text-xl font-bold shadow-xl">
          PROJECT LIMITLESS
        </span>
      </button>
    </div>
  );
}
