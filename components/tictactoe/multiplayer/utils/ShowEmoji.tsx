import Button from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';

const EMOJIS = [
  '😀',
  '😂',
  '😎',
  '🤔',
  '😮',
  '😏',
  '😢',
  '😡',
  '🤯',
  '🥳',
  '😴',
  '🫡',
  '😤',
  '👀',
  '❤️',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🔥',
  '💥',
  '💯',
  '🏆',
  '‼️',
  '☠️',
  '🏴‍☠️',
  '⚓',
  '⚔️',
  '💰',
  '🦜',
];

export default function ShowEmoji({
  open,
  onClose,
  sendEmoji,
}: {
  open: boolean;
  onClose: () => void;
  sendEmoji: (emoji: string) => void;
}) {
  return (
    <Modal ariaLabel="emojiModal" onClose={onClose} open={open}>
      <div className="flex max-h-full w-80 max-w-[90vw] flex-col rounded-xl border-2 border-slate-300 bg-white p-4 shadow-2xl dark:border-red-700 dark:bg-red-950">
        <Button
          variant="unstyled"
          className="mb-3 w-full shrink-0 border-2 border-slate-300 bg-white py-2 tracking-wide text-slate-800 hover:border-amber-500 hover:bg-slate-100 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300 dark:hover:border-yellow-500 dark:hover:bg-red-800"
          onClick={onClose}
        >
          ⚓ Close Window ☠️
        </Button>
        <div className="grid min-h-0 grid-cols-5 gap-2 overflow-x-hidden overflow-y-auto p-1">
          {EMOJIS.map((emoji, i) => (
            <Button
              key={i}
              variant="unstyled"
              className="aspect-square w-full border-2 border-slate-200 bg-white text-3xl hover:scale-105 hover:border-amber-400 hover:bg-amber-50 dark:border-red-700 dark:bg-red-900 dark:hover:bg-red-800"
              onClick={() => {
                sendEmoji(emoji);
                onClose();
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
