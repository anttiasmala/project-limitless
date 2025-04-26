import Link from 'next/link';
import { NextRouter } from 'next/router';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function LinkElement({
  children,
  titleText,
  href,
  openLinkInNewTab = false,
  className,
}: {
  /** **children overwrites titleText!!** */
  children?: ReactNode;
  /** **children overwrites titleText!** */
  titleText?: string;
  href: string;
  openLinkInNewTab?: boolean;
  className?: string;
}) {
  let childrenOrTitleText: ReactNode | string | undefined;

  if (titleText) childrenOrTitleText = titleText;
  if (children) childrenOrTitleText = children;

  return (
    <Link
      href={href}
      target={openLinkInNewTab ? '_blank' : '_self'}
      className={twMerge(
        'm-3 font-bold text-black hover:text-blue-500 active:text-blue-500',
        className,
      )}
    >
      {childrenOrTitleText ? (
        childrenOrTitleText
      ) : (
        <span className="animate-[background_1s_infinite] bg-yellow-300 font-bold text-red-500">
          You didn't give any children or titleText!
        </span>
      )}
    </Link>
  );
}
