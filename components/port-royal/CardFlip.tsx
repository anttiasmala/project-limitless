import Image from 'next/image';
import { ReactNode } from 'react';
import { CARD_ART_H, CARD_ART_W, cardArt } from '@/utils/port-royal/types';

/**
 * Wraps a card face. When `flipMs` is more than 0, the card starts with its back
 * (the coin) showing and turns over to show the card in that many milliseconds.
 * When it is 0, the card face is shown instantly without turning a card over.
 */
export default function CardFlip({
  flipMs,
  children,
}: {
  flipMs: number;
  children: ReactNode;
}) {
  const flipping = flipMs > 0;

  return (
    <div className={`flex-none ${flipping ? 'perspective-[1100px]' : ''}`}>
      <div
        className={`relative ${flipping ? 'transform-3d' : ''}`}
        style={
          flipping
            ? { animation: `portRoyalCardFlip ${flipMs}ms ease-in-out both` }
            : undefined
        }
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
