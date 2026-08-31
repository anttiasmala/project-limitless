'use client';

import { useEffect, useReducer } from 'react';
import ActionBar from './ActionBar';
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
import SettingsOverlay from './overlays/SettingsOverlay';
import TaxOverlay from './overlays/TaxOverlay';
import { BOARD_NOISE, BOARD_VIGNETTE } from './shapes';
import { freshState, reducer, seatOf } from '@/lib/port-royal/gameLogic';
import { PLAYER_NAMES, TARGET_VP } from '@/utils/port-royal/types';

const TOAST_MS = 2600;

/** The one line of rules text the left rail shows, chosen by phase. */
const HINTS: Record<string, string> = {
  discovery:
    'A second ship of a colour already in the harbour ends the phase and the haul is lost.',
  others: "Payment goes to the active player's hand, not the crown.",
};

const DEFAULT_HINT =
  'Coin cards are worth one coin each and stay hidden from other players.';

/**
 * @param names One seat per name. The landing page passes the roster chosen
 *   there; the default keeps a bare `/port-royal` working as it always did.
 */
export default function PortRoyal({
  names = PLAYER_NAMES,
}: {
  names?: string[];
}) {
  // The first deck is dealt unshuffled so the server and the client agree on
  // the markup; SHUFFLE swaps in a real one as soon as we are on the client.
  // The handover curtain is up at that point, so nothing visible changes.
  const [state, dispatch] = useReducer(reducer, names, (seats) =>
    freshState(seats, false),
  );

  useEffect(() => {
    dispatch({ type: 'SHUFFLE' });
  }, []);

  // A replacement toast is a new object, which restarts this timer — the way
  // the prototype cleared and re-armed its timeout on every `say()`.
  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  // Turn transitions the engine asked for but deliberately delayed, so a
  // purchase is visible for a beat before the seat changes.
  useEffect(() => {
    const next = state.scheduled;
    if (!next) return;
    const timer = setTimeout(() => dispatch({ type: next.kind }), next.delay);
    return () => clearTimeout(timer);
  }, [state.scheduled]);

  const seat = seatOf(state);
  const buying = state.phase === 'trade' || state.phase === 'others';
  const selected = state.harbour.find((c) => c.id === state.selected);

  return (
    <div
      className="bg-portRoyal-ground font-archivo text-portRoyal-ink relative flex min-h-0 w-full flex-col overflow-hidden"
      style={{ backgroundImage: `${BOARD_VIGNETTE}, ${BOARD_NOISE}` }}
    >
      {/* Compass rose, purely decorative. */}
      <div className="border-portRoyal-wood/35 pointer-events-none absolute top-37.5 left-11 h-115 w-115 rounded-full border opacity-50">
        <div className="border-portRoyal-wood/30 absolute inset-17.5 rounded-full border" />
      </div>

      <header className="bg-portRoyal-ink text-portRoyal-ground relative flex flex-none items-stretch gap-4.5 px-6 py-3">
        <div className="flex min-w-47.5 flex-col justify-center">
          <div className="font-spectral text-[19px] font-semibold tracking-[0.04em]">
            Port Royal
          </div>
          <div className="font-archivo-narrow text-portRoyal-wood text-[10px] tracking-[0.2em] uppercase">
            hotseat · target {TARGET_VP} pts
          </div>
        </div>

        <div className="bg-portRoyal-steel w-px" />

        <PlayerStrip
          players={state.players}
          active={state.active}
          taker={state.taker}
          phase={state.phase}
        />

        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="font-archivo-narrow text-portRoyal-parchment hover:border-portRoyal-brass min-h-11 cursor-pointer self-center border border-[#4A5560] bg-transparent px-3.5 py-2.5 text-[11px] tracking-[0.16em] uppercase"
        >
          Settings
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          deckCount={state.deck.length}
          discard={state.discard}
          hint={HINTS[state.phase] ?? DEFAULT_HINT}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Harbour
            harbour={state.harbour}
            seat={seat}
            buying={buying}
            discovering={state.phase === 'discovery'}
            selected={state.selected}
            onPick={(card) => dispatch({ type: 'PICK', card })}
            onInspect={(card) => dispatch({ type: 'INSPECT', card })}
          />

          <div className="flex min-h-0 flex-1 gap-4.5 px-6 pt-1 pb-3">
            <Tableau
              seat={seat}
              onInspect={(card) => dispatch({ type: 'INSPECT', card })}
            />
            <HandRail seat={seat} />
          </div>
        </div>
      </div>

      <ActionBar
        state={state}
        seat={seat}
        selected={selected}
        dispatch={dispatch}
      />

      {state.toast && <Toast toast={state.toast} />}

      {state.phase === 'handover' && (
        <HandoverOverlay
          nextName={state.players[state.active].name}
          onBegin={() => dispatch({ type: 'BEGIN_TURN' })}
        />
      )}

      {state.phase === 'bust' && state.bustPair && (
        <BustOverlay
          pair={state.bustPair}
          onAcknowledge={() => dispatch({ type: 'ACK_BUST' })}
        />
      )}

      {state.phase === 'tax' && state.tax && (
        <TaxOverlay
          rows={state.tax}
          onAcknowledge={() => dispatch({ type: 'ACK_TAX' })}
        />
      )}

      {state.detail && (
        <DetailOverlay
          card={state.detail}
          onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
        />
      )}

      {state.settings && (
        <SettingsOverlay
          onClose={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          onRestart={() => dispatch({ type: 'RESTART' })}
        />
      )}

      {state.phase === 'end' && state.winner !== null && (
        <EndOverlay
          players={state.players}
          winner={state.winner}
          onRestart={() => dispatch({ type: 'RESTART' })}
        />
      )}
    </div>
  );
}
