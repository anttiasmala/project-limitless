import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

type Logo = {
  wrapperClassName?: string;
  imageClassName?: string;
};

export default function Logo({ wrapperClassName, imageClassName }: Logo) {
  return (
    <div className={twMerge('', wrapperClassName)}>
      <Image
        src={'/images/logo_with_text.svg'}
        alt="Logo icon"
        loading="eager"
        height={128}
        width={128}
        className={twMerge('', imageClassName)}
      />
    </div>
  );
}
