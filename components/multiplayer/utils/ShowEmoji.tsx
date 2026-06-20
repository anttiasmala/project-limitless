import Button from '@/components/utils/Button';
import { Modal } from '@/components/utils/Modal';
import { Player } from '@/lib/gameLogic';
import { RoomState } from '@/utils/multiplayer/multiplayerTypes';
import { toast } from 'react-toastify';

const EMOJIS = [
  '😀',
  '👁',
  '👨‍⚖️',
  '🤥',
  '🧱',
  '⌚️',
  '📱',
  '📲',
  '💻',
  '⌨️',
  '🖥',
  '🖨',
  '🖱',
  '🖲',
  '🕹',
  '🗜',
  '💽',
  '💾',
  '💿',
  '📀',
  '📼',
  '📷',
];

export default function ShowEmoji({
  open,
  onClose,
  sendEmoji,
  roomState,
  myPlayer,
}: {
  open: boolean;
  onClose: () => void;
  sendEmoji: (emoji: string, senderId: string) => void;
  roomState: RoomState | null;
  myPlayer: Player | null;
}) {
  let playerId: string;
  const players = roomState?.players;
  Object.values(players ?? {}).map((player) => {
    if (player.player === myPlayer) {
      playerId = player.id;
      /*
      console.log(player);
      console.log(player.player);
      console.log(player.player === myPlayer);
      */
    }
  });
  return (
    <Modal ariaLabel="emojiModal" onClose={onClose} open={open}>
      <div className="flex flex-col">
        <Button
          variant="unstyled"
          className="mb-2 w-full shrink-0 border-2 border-slate-300 bg-white py-2 tracking-wide text-slate-800 hover:border-amber-500 hover:bg-slate-100 dark:border-red-700 dark:bg-red-900 dark:text-yellow-300 dark:hover:border-yellow-500 dark:hover:bg-red-800"
          onClick={onClose}
        >
          ⚓ Close Window ☠️
        </Button>
        <div className="grid grid-cols-5">
          {EMOJIS.map((emoji, i) => (
            <Button
              key={i}
              variant="unstyled"
              className={`m-3 aspect-square w-max border-2 border-slate-200 bg-white text-3xl hover:scale-105 hover:border-amber-400 hover:bg-amber-50 dark:border-red-700 dark:bg-red-900 dark:hover:bg-red-800`}
              onClick={(e) => {
                sendEmoji(e.currentTarget.innerText, playerId);
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
