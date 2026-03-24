import { KrakenMood } from '@/utils/krakenMood';
import { twMerge } from 'tailwind-merge';

const MOOD_CONFIG: Record<
  KrakenMood,
  {
    emoji: string;
    label: string;
    emojiClassName: string;
    labelClassName: string;
  }
> = {
  idle: {
    emoji: '🐙',
    label: 'Lurking in the deep…',
    emojiClassName: 'opacity-60',
    labelClassName: 'opacity-60 dark:text-amber-500 text-black',
  },
  thinking: {
    emoji: '🐙',
    label: 'Plotting your doom…',
    emojiClassName: 'animate-pulse text-red-400',
    labelClassName: 'animate-pulse text-red-400',
  },
  angry: {
    emoji: '🐙',
    label: 'The Kraken RAGES!',
    emojiClassName: 'animate-bounce text-red-500',
    labelClassName: 'animate-bounce text-red-500',
  },
  confident: {
    emoji: '🐙',
    label: 'Victory is mine…',
    emojiClassName: 'text-yellow-400',
    labelClassName: 'text-yellow-400',
  },
  victorious: {
    emoji: '🐙',
    label: 'KRAKEN WINS! MWAHAHA!',
    emojiClassName: 'animate-bounce text-yellow-300 scale-125',
    labelClassName: 'animate-bounce text-yellow-300',
  },
  defeated: {
    emoji: '🐙',
    label: "This isn't over…",
    emojiClassName: 'opacity-30 scale-75',
    labelClassName: 'opacity-30 text-black dark:text-amber-500 ',
  },
  draw: {
    emoji: '🐙',
    label: 'Hmph. Adequate.',
    emojiClassName: 'opacity-70 text-amber-500',
    labelClassName: 'opacity-70 text-amber-500',
  },
};

export default function KrakenAvatar({ mood }: { mood: KrakenMood }) {
  const { emoji, label, emojiClassName, labelClassName } = MOOD_CONFIG[mood];

  return (
    <div className="flex flex-col items-center gap-1 transition-all duration-500">
      <div
        className={twMerge(
          'text-5xl transform transition-transform duration-500',
          emojiClassName,
        )}
      >
        {emoji}
      </div>
      <p
        className={twMerge(
          'text-center italic max-w-28 transition-all duration-500',
          labelClassName,
        )}
      >
        {label}
      </p>
    </div>
  );
}
