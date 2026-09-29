import Image from 'next/image';
import { ReactNode } from 'react';
import { CARD_ART_H, CARD_ART_W, cardArt } from '@/utils/port-royal/types';

/**
 * Wraps a card face. When `flipping` is true, the card starts with its back
 * (the coin) showing and turns over to show the card.
 */
export default function CardFlip({
  flipping,
  children,
}: {
  flipping: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex-none ${flipping ? 'perspective-[1100px]' : ''}`}>
      <div
        className={`relative ${
          flipping
            ? 'animate-[portRoyalCardFlip_0.75s_ease-in-out_both] transform-3d motion-reduce:animate-none'
            : ''
        }`}
      >
        <div className={flipping ? 'backface-hidden' : ''}>{children}</div>

        {flipping && (
          <Image
            src={cardArt('cardback.png')}
            alt=""
            width={CARD_ART_W}
            height={CARD_ART_H}
            className="pointer-events-none absolute inset-0 h-full w-full rotate-y-180 object-contain shadow-[0_6px_14px_rgba(31,42,51,0.16)] backface-hidden"
          />
        )}
      </div>
    </div>
  );
}
