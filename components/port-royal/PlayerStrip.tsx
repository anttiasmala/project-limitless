import {
  anchorOf,
  crossOf,
  houseOf,
  jacksOf,
  swordsOf,
  vpOf,
} from '@/lib/port-royal/gameLogic';
import { CARD_ART_DIR, Phase, Player } from '@/utils/port-royal/types';
import Image from 'next/image';

/**
 * The scoreboard along the top bar: one card per player, showing influence,
 * coins in hand and swords. Coin counts are public — only the coin cards
 * themselves are hidden — so this stays visible through every phase.
 */
export default function PlayerStrip({
  players,
  active,
  taker,
  phase,
}: {
  players: Player[];
  active: number;
  taker: number | null;
  phase: Phase;
}) {
  return (
    <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto">
      {players.map((p, i) => {
        const isActive = i === active;
        const isTaking = phase === 'others' && i === taker;

        return (
          // Cards sit at their natural width and shrink from it, so a
          // three-player table looks as it always did and a five-player one
          // still fits the bar instead of sliding off the end.
          <div
            key={p.name}
            className={`flex w-44 min-w-0 shrink flex-col gap-1.25 border px-3 py-2 ${
              isActive
                ? 'border-portRoyal-brass bg-portRoyal-brass/16'
                : isTaking
                  ? 'border-portRoyal-steel bg-portRoyal-teal/30'
                  : 'border-portRoyal-steel bg-transparent'
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className={`h-2 w-2 flex-none rounded-full ${
                  isActive
                    ? 'bg-portRoyal-brass'
                    : isTaking
                      ? 'bg-portRoyal-teal'
                      : 'bg-portRoyal-slate'
                }`}
              />
              <span className="font-spectral text-portRoyal-ground truncate text-[15px] font-semibold">
                {p.name}
              </span>
              {p.kind === 'ai' && (
                <span
                  title="This seat is played by the computer"
                  className="font-archivo-narrow border-portRoyal-steel text-portRoyal-slate flex-none border px-1 text-[8px] leading-normal tracking-[0.16em] uppercase"
                >
                  cpu
                </span>
              )}
              <span
                className={`font-archivo-narrow ml-auto flex-none text-[9px] tracking-[0.16em] uppercase ${
                  isActive
                    ? 'text-portRoyal-brassLight'
                    : 'text-portRoyal-slate'
                }`}
              >
                {isActive ? 'active' : isTaking ? 'taking' : 'waiting'}
              </span>
            </div>

            <div className="flex flex-col items-baseline tabular-nums">
              <div className="flex items-center gap-3 tabular-nums">
                <div className="text-portRoyal-ground flex items-center text-[20px] font-bold">
                  <Image
                    src={`${CARD_ART_DIR}/realVictoryPoints.png`}
                    alt="Victory Points icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{vpOf(p)}</span>
                </div>
                <div className="text-portRoyal-brassLight flex items-center text-[20px] font-semibold">
                  <Image
                    src={`${CARD_ART_DIR}/realCoins.png`}
                    alt="Coins icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{p.hand.length}</span>
                </div>
                <div className="text-portRoyal-ground flex items-center text-[20px] font-semibold">
                  <Image
                    src={`${CARD_ART_DIR}/realSwords.png`}
                    alt="Swords icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{swordsOf(p)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                <div className="text-portRoyal-ground flex items-center text-[20px] font-semibold">
                  <Image
                    src={`${CARD_ART_DIR}/realHouse.png`}
                    alt="Houses icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{houseOf(p)}</span>
                </div>
                <div className="text-portRoyal-ground flex items-center text-[20px] font-semibold">
                  <Image
                    src={`${CARD_ART_DIR}/realCross.png`}
                    alt="Crosses icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{crossOf(p)}</span>
                </div>
                <div className="text-portRoyal-ground flex items-center text-[20px] font-semibold">
                  <Image
                    src={`${CARD_ART_DIR}/realAnchor.png`}
                    alt="Anchors icon"
                    width={32}
                    height={32}
                    className="h-4 w-4"
                  />
                  <span className="ml-1">{anchorOf(p)}</span>
                </div>
                {jacksOf(p) > 0 && (
                  <div
                    title={`${jacksOf(p)} Jack of all Trades — each supplies any one expedition symbol`}
                    className="font-archivo-narrow text-portRoyal-brassLight flex items-baseline self-center text-[11px] tracking-[0.12em] uppercase"
                  >
                    <span className="text-[15px] font-semibold">
                      +{jacksOf(p)}
                    </span>
                    <span className="ml-1">any</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
