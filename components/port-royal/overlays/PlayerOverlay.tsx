import { PlayerTotals } from '../HandRail';
import Tableau from '../Tableau';
import { useKeyPress } from '@/hooks/useKeyPress';
import { Player, TableauCard } from '@/utils/port-royal/types';

/**
 * Everything the other players can see about one player: the cards they have
 * hired, the expeditions they have claimed, and their totals. In the board game
 * these cards lie face-up on the table. Coin cards stay hidden, only their
 * number is shown.
 *
 * Opened by a click on a player in the top bar. It only shows the game, so it
 * can be open during any turn, also a bot's turn.
 *
 * @param escapeCloses False while another overlay (e.g. a card's details) is
 * open on top of this one. Then Escape closes only that overlay.
 */
export default function PlayerOverlay({
  player,
  isSeat,
  escapeCloses,
  onInspect,
  onClose,
}: {
  player: Player;
  /** Whether this is the player whose turn is on the board. */
  isSeat: boolean;
  escapeCloses: boolean;
  onInspect: (card: TableauCard) => void;
  onClose: () => void;
}) {
  useKeyPress('Escape', onClose, escapeCloses);

  return (
    <div
      onClick={onClose}
      className="bg-portRoyal-ink/72 fixed inset-0 z-50 overflow-y-auto overscroll-contain"
    >
      {/* A click here also closes: it bubbles up to the backdrop. */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* The panel is a reading surface, not a dismiss target. */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-portRoyal-vellum border-portRoyal-wood flex w-full max-w-190 flex-col gap-4 border px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:px-8 sm:py-7"
        >
          <div className="flex items-start gap-3.5">
            <div>
              <div className="font-archivo-narrow text-portRoyal-wood text-[10px] tracking-[0.22em] uppercase">
                {player.kind === 'ai' ? 'Computer player' : 'Player'}
                {isSeat && ' · on turn'}
              </div>
              <div className="font-spectral text-[26px] leading-[1.1] font-semibold sm:text-[32px]">
                {player.name}
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="border-portRoyal-wood/70 text-portRoyal-slate ml-auto h-11 w-11 cursor-pointer border bg-transparent text-[16px]"
            >
              ×
            </button>
          </div>

          <PlayerTotals player={player} />

          <Tableau player={player} onInspect={onInspect} />
        </div>
      </div>
    </div>
  );
}
