'use client';

import { useEffect, useReducer, useState } from 'react';
import ActionBar from './ActionBar';
import Expeditions from './Expeditions';
import HandRail from './HandRail';
import Harbour from './Harbour';
import PlayerStrip from './PlayerStrip';
import Sidebar from './Sidebar';
import Tableau from './Tableau';
import Toast from './Toast';
import BustOverlay from './overlays/BustOverlay';
import DetailOverlay from './overlays/DetailOverlay';
import EndOverlay from './overlays/EndOverlay';
import HandoverOverlay from './overlays/HandoverOverlay';
import PlayerOverlay from './overlays/PlayerOverlay';
import SettingsOverlay from './overlays/SettingsOverlay';
import TaxOverlay from './overlays/TaxOverlay';
import { BOARD_NOISE, BOARD_VIGNETTE } from './shapes';
import { usePortRoyalSettings } from '@/hooks/port-royal/usePortRoyalSettings';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { botTurn } from '@/lib/port-royal/ai';
import {
  claimCheck,
  claimingIn,
  expeditionsRemain,
  finalRound,
  freshState,
  isBot,
  reachedTarget,
  reducer,
  seatOf,
  swordsOf,
  taxFor,
} from '@/lib/port-royal/gameLogic';
import { DEFAULT_ROSTER } from '@/lib/port-royal/roster';
import {
  Action,
  DEFAULT_RULES,
  Flipped,
  Rules,
  Seat,
  TARGET_VP,
} from '@/utils/port-royal/types';
import RepelOverlay from './overlays/RepelOverlay';

const TOAST_MS = 2600;

/**
 * How a drawn card is shown before the game goes on with it. `flipMs` is the
 * length of the flip animation (`portRoyalCardFlip` in globals.css), 0 = no flip.
 * `revealMs` is the wait before the game goes on (overlays, toast, next draw).
 * In a normal game the wait is a bit longer than the flip, so the player can
 * see the card before an overlay opens.
 */
type Reveal = { flipMs: number; revealMs: number };

const NORMAL_REVEAL: Reveal = { flipMs: 750, revealMs: 950 };
/** "Reduce animation": no motion, but the same wait as a normal game. */
const STILL_REVEAL: Reveal = { flipMs: 0, revealMs: 950 };
/** "Fast game": a quick flip and no extra pause after it. */
const QUICK_REVEAL: Reveal = { flipMs: 300, revealMs: 300 };
/** Both settings on: the card is shown instantly. */
const INSTANT_REVEAL: Reveal = { flipMs: 0, revealMs: 0 };

/** The one line of rules text the left rail shows, chosen by phase. */
const HINTS: Record<string, string> = {
  discovery:
    'A second ship of a colour already in the harbour ends the phase and the drawn cards are lost.',
  others:
    "Buying out of turn owes the active player a coin out of hand for a hire. On ships coin is payed off the top of a ship's coin amount.",
};

const DEFAULT_HINT =
  'Coin cards are worth one coin each and stay hidden from other players.';

/**
 * What a real player may still do while the game waits for a bot. These only
 * look at the game, control the app, or close a notice that a person has read.
 * Every other action is a decision, and only the bot makes its own decisions.
 */
const ALLOWED_ON_BOT_TURN = new Set<Action['type']>([
  'INSPECT',
  'CLOSE_DETAIL',
  'TOGGLE_SETTINGS',
  'RESTART',
  'ACK_BUST',
  'ACK_TAX',
]);

/**
 * @param seats One "seat" per entry: human or computer.
 * @param rules The rules chosen on the landing page.
 */
export default function PortRoyal({
  seats = DEFAULT_ROSTER,
  rules = DEFAULT_RULES,
}: {
  seats?: Seat[];
  rules?: Rules;
}) {
  // The first deck is dealt unshuffled so the server and the client agree on
  // the markup; SHUFFLE swaps in a real one as soon as we are on the client.
  // The handover curtain is up at that point, so nothing visible changes.
  const [state, dispatch] = useReducer(reducer, { seats, rules }, (setup) =>
    freshState(setup.seats, setup.rules, false),
  );

  useEffect(() => {
    dispatch({ type: 'SHUFFLE' });
  }, []);

  // Loads Port Royal settings from LocalStorage
  const [settings] = usePortRoyalSettings();
  const reduceMotion = usePrefersReducedMotion() || settings.reduceAnimation;
  // "Reduce animation" decides if the card moves, "Fast game" how long the game waits.
  const { flipMs, revealMs } = settings.fastGame
    ? reduceMotion
      ? INSTANT_REVEAL
      : QUICK_REVEAL
    : reduceMotion
      ? STILL_REVEAL
      : NORMAL_REVEAL;

  // The flip that has already been shown to the players. While the latest flip
  // is not this one, its card is being revealed, and everything the card causes
  // (overlays, toast, the next move of a bot) waits.
  const [revealed, setRevealed] = useState<Flipped | null>(null);

  // The index of the player whose cards are open, or null. Only a view of the
  // game, so it lives here and not in the reducer. The index (not a copy of the
  // player) keeps the view up to date when the player buys during it.
  const [viewing, setViewing] = useState<number | null>(null);
  const revealing =
    revealMs > 0 && state.flipped && state.flipped !== revealed
      ? state.flipped.card
      : null;

  // Also runs when there is no wait. Then `revealed` keeps up with the flips,
  // and a later switch back to a wait does not reveal an old card again.
  useEffect(() => {
    const flipped = state.flipped;
    if (!flipped || flipped === revealed) return;
    const timer = setTimeout(() => setRevealed(flipped), revealMs);
    return () => clearTimeout(timer);
  }, [state.flipped, revealed, revealMs]);

  // A replacement toast is a new object, which restarts this timer — the way
  // the prototype cleared and re-armed its timeout on every `say()`.
  // The toast is hidden while a card turns over, so its time starts after that.
  useEffect(() => {
    if (!state.toast || revealing) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state.toast, revealing]);

  // Turn transitions the engine asked for but deliberately delayed, so a
  // purchase is visible for a beat before the seat changes.
  useEffect(() => {
    const next = state.scheduled;
    if (!next) return;
    const timer = setTimeout(() => dispatch({ type: next.kind }), next.delay);
    return () => clearTimeout(timer);
  }, [state.scheduled]);

  // Checks if current turn is Bot's turn. Adds an timeout for the move so real-players can follow easier what the bot does
  // Returns null if the board is waiting a real-player
  useEffect(() => {
    if (revealing) return;
    const turn = botTurn(state);
    if (!turn) return;
    const timer = setTimeout(() => dispatch(turn.action), turn.delay);
    return () => clearTimeout(timer);
  }, [state, revealing]);

  const seat = seatOf(state);
  // The game waits for a bot's decision, so the real players only watch.
  const botDeciding = isBot(seat) && state.phase !== 'end';

  // Every click on the board goes through here. The bot effect above uses
  // `dispatch` directly, so it is not stopped by this check.
  const playerDispatch = (action: Action) => {
    if (botDeciding && !ALLOWED_ON_BOT_TURN.has(action.type)) return;
    dispatch(action);
  };

  // The phase the board shows. It stays in discovery until the flipped card has turned over.
  const phase = revealing ? 'discovery' : state.phase;
  const buying = state.phase === 'trade' || state.phase === 'others';
  const selected = state.harbour.find((c) => c.id === state.selected);

  const detail = state.detail;
  const posted =
    detail?.kind === 'expedition'
      ? state.expeditions.find((e) => e.id === detail.id)
      : undefined;
  // A bot claims its expeditions by itself, so a real player is not offered the claim for it.
  const claim = posted && !botDeciding ? claimCheck(state, posted) : null;

  return (
    <div
      // Turns off every animation and transition inside the board (see globals.css).
      data-reduce-motion={reduceMotion || undefined}
      // `overflow-clip` and not `overflow-hidden`: "hidden" would make the board
      // its own scroll box, and then the sticky action bar would not stick.
      className="bg-portRoyal-ground font-archivo text-portRoyal-ink relative flex min-h-0 w-full flex-col overflow-clip"
      style={{ backgroundImage: `${BOARD_VIGNETTE}, ${BOARD_NOISE}` }}
    >
      {/* Compass rose, purely decorative. */}
      <div className="border-portRoyal-wood/35 pointer-events-none absolute top-37.5 left-11 h-115 w-115 rounded-full border opacity-50">
        <div className="border-portRoyal-wood/30 absolute inset-17.5 rounded-full border" />
      </div>

      {/* On a phone the players go to a second row under the title and the
          Settings button. From `sm` everything is on one row. */}
      <header className="bg-portRoyal-ink text-portRoyal-ground relative flex flex-none flex-wrap items-stretch gap-x-4.5 gap-y-2 px-4 py-2 sm:flex-nowrap lg:px-6 lg:py-3">
        <div className="flex flex-col justify-center lg:min-w-47.5">
          <div className="font-spectral text-[17px] font-semibold tracking-[0.04em] lg:text-[19px]">
            Port Royal
          </div>
          <div className="font-archivo-narrow text-portRoyal-wood text-[10px] tracking-[0.2em] uppercase">
            hotseat · target {TARGET_VP} pts
            {state.rules.expeditionToWin && ' + expedition'}
          </div>
          {finalRound(state) && state.phase !== 'end' && (
            <div className="font-archivo-narrow text-portRoyal-brass text-[10px] tracking-[0.2em] uppercase">
              final round
            </div>
          )}
        </div>

        <div className="bg-portRoyal-steel hidden w-px lg:block" />

        <PlayerStrip
          players={state.players}
          active={state.active}
          taker={state.taker}
          phase={state.phase}
          expeditionRule={state.rules.expeditionToWin}
          expeditionsRemain={expeditionsRemain(state)}
          onView={setViewing}
        />

        <button
          type="button"
          onClick={() => playerDispatch({ type: 'TOGGLE_SETTINGS' })}
          className="font-archivo-narrow text-portRoyal-parchment hover:border-portRoyal-brass ml-auto min-h-11 cursor-pointer self-center border border-[#4A5560] bg-transparent px-3.5 py-2.5 text-[11px] tracking-[0.16em] uppercase sm:ml-0"
        >
          Settings
        </button>
      </header>

      {/* Below `lg` the board is one column, and the sidebar goes to the
          bottom, so the harbour is right under the header. */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar
          deckCount={state.deck.length}
          discard={state.discardPile.length}
          hint={HINTS[phase] ?? DEFAULT_HINT}
        />

        <div className="flex min-w-0 flex-1 flex-col max-lg:order-first">
          <Expeditions
            // A flipped expedition moves to this row after it has turned over in the harbour.
            expeditions={state.expeditions.filter(
              (e) => e.id !== revealing?.id,
            )}
            seat={seat}
            claiming={claimingIn(state.phase) && !botDeciding}
            onInspect={(card) => playerDispatch({ type: 'INSPECT', card })}
          />

          <Harbour
            harbour={state.harbour}
            seat={seat}
            buying={buying}
            tax={taxFor(state.phase)}
            discovering={phase === 'discovery'}
            selected={state.selected}
            alternative={settings.alternativeTheme}
            smoothScroll={!reduceMotion}
            revealing={revealing}
            flipMs={flipMs}
            pickable={!botDeciding}
            onPick={(card) => playerDispatch({ type: 'PICK', card })}
            onInspect={(card) => playerDispatch({ type: 'INSPECT', card })}
          />

          <div className="flex min-h-0 flex-1 flex-col gap-4.5 px-4 pt-1 pb-3 lg:flex-row lg:px-6">
            <Tableau
              player={seat}
              onInspect={(card) => playerDispatch({ type: 'INSPECT', card })}
            />
            <HandRail seat={seat} />
          </div>
        </div>
      </div>

      {/* Sticks to the bottom of the screen when the board is taller than the
          screen (on a phone), so the buttons can always be reached. The toast
          is inside it, so the toast is always just above the buttons. */}
      <div className="sticky bottom-0 z-20 flex-none">
        {state.toast && !revealing && <Toast toast={state.toast} />}

        <ActionBar
          state={state}
          seat={seat}
          selected={selected}
          revealing={revealing !== null}
          botDeciding={botDeciding}
          dispatch={playerDispatch}
        />
      </div>

      {/* Comes before the game's overlays, so a repel offer or a handover
          opens on top of it. The card details come after, so a click on a
          card here opens them on top. */}
      {viewing !== null && state.players[viewing] && (
        <PlayerOverlay
          player={state.players[viewing]}
          isSeat={state.players[viewing] === seat}
          escapeCloses={!state.detail}
          onInspect={(card) => playerDispatch({ type: 'INSPECT', card })}
          onClose={() => setViewing(null)}
        />
      )}

      {phase === 'repel' && state.repelShip && (
        <RepelOverlay
          ship={state.repelShip}
          swords={swordsOf(state.players[state.active])}
          playerName={state.players[state.active].name}
          clashes={state.harbour.some(
            (c) =>
              c.kind === 'ship' && c.colorIdx === state.repelShip!.colorIdx,
          )}
          botDeciding={botDeciding}
          onRepel={() => playerDispatch({ type: 'REPEL' })}
          onDecline={() => playerDispatch({ type: 'DECLINE_REPEL' })}
        />
      )}

      {/* A computer seat has no device to be handed, so the whose turn is only
          shown when it is real-player's turn. */}
      {state.phase === 'handover' && !isBot(state.players[state.active]) && (
        <HandoverOverlay
          nextName={state.players[state.active].name}
          finalRound={finalRound(state)}
          onBegin={() => playerDispatch({ type: 'BEGIN_TURN' })}
        />
      )}

      {phase === 'bust' && state.bustPair && (
        <BustOverlay
          pair={state.bustPair}
          onAcknowledge={() => playerDispatch({ type: 'ACK_BUST' })}
        />
      )}

      {phase === 'tax' && state.tax && (
        <TaxOverlay
          event={state.tax}
          onInspect={(card) => playerDispatch({ type: 'INSPECT', card })}
          onAcknowledge={() => playerDispatch({ type: 'ACK_TAX' })}
        />
      )}

      {state.detail && (
        <DetailOverlay
          card={state.detail}
          claim={
            posted && claim
              ? {
                  handIn: claim.handIn.map((c) => c.name),
                  blocked: claim.blocked,
                  onClaim: () =>
                    playerDispatch({ type: 'CLAIM_EXPEDITION', id: posted.id }),
                }
              : undefined
          }
          onClose={() => playerDispatch({ type: 'CLOSE_DETAIL' })}
        />
      )}

      {state.settings && (
        <SettingsOverlay
          onClose={() => playerDispatch({ type: 'TOGGLE_SETTINGS' })}
          onRestart={() => playerDispatch({ type: 'RESTART' })}
        />
      )}

      {state.phase === 'end' && state.endReason && (
        <EndOverlay
          players={state.players}
          winners={state.winners}
          endReason={state.endReason}
          qualified={state.players.map((p) => reachedTarget(state, p))}
          expeditionRule={state.rules.expeditionToWin}
          onRestart={() => playerDispatch({ type: 'RESTART' })}
        />
      )}
    </div>
  );
}
