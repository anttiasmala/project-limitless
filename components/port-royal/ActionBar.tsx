import { nothingToDraw } from '@/lib/port-royal/gameLogic';
import {
  Action,
  GameState,
  HarbourCard,
  Player,
} from '@/utils/port-royal/types';

type BarAction = {
  label: string;
  action: Action;
  primary: boolean;
  disabled: boolean;
};

const PHASE_LABEL: Partial<Record<GameState['phase'], string>> = {
  discovery: 'Phase · Discovery',
  trade: 'Phase · Trade & hire',
  others: 'Phase · Trade & hire · others',
};

function plural(n: number, word: string) {
  return `${n} ${word}${n > 1 ? 's' : ''}`;
}

function question(
  phase: GameState['phase'],
  harbourSize: number,
  takesLeft: number,
  seat: Player,
  active: Player,
  dry: boolean,
): string {
  switch (phase) {
    case 'discovery':
      // The next flip ends the game, so the player has to know it before clicking.
      if (dry) {
        return harbourSize
          ? `No cards are left. Bank ${plural(harbourSize, 'card')}, or flip to end the game?`
          : 'No cards are left. Flipping ends the game.';
      }
      return harbourSize
        ? `Push your luck, or bank ${plural(harbourSize, 'card')}?`
        : 'Begin the discovery — flip the first card.';
    case 'trade':
      return `Take ${plural(takesLeft, 'card')} from the harbour.`;
    case 'others':
      return `${seat.name}, take ${plural(takesLeft, 'card')} - a coin to ${active.name}, plus its cost?`;
    case 'bust':
      return 'Two ships of one colour.';
    default:
      return '…';
  }
}

function actionsFor(
  phase: GameState['phase'],
  harbourSize: number,
  selected: HarbourCard | undefined,
  activeName: string,
  dry: boolean,
): BarAction[] {
  if (phase === 'discovery') {
    return [
      {
        label: dry ? 'Flip — end the game' : 'Flip another card',
        action: { type: 'FLIP' },
        primary: true,
        disabled: false,
      },
      {
        label: harbourSize ? 'Stop — keep the haul' : 'Stop',
        action: { type: 'STOP' },
        primary: false,
        disabled: !harbourSize,
      },
    ];
  }

  if (phase === 'trade') {
    return [
      {
        label: selected
          ? selected.kind === 'ship'
            ? `Bring in the ${selected.name}`
            : `Hire ${selected.name.split(' — ')[0]}`
          : 'Select a card',
        action: { type: 'TAKE' },
        primary: true,
        disabled: !selected,
      },
      {
        label: 'Done trading',
        action: { type: 'TO_OTHERS' },
        primary: false,
        disabled: false,
      },
    ];
  }

  if (phase === 'others') {
    return [
      {
        label: selected ? `Take & pay ${activeName}` : 'Select a card',
        action: { type: 'TAKE' },
        primary: true,
        disabled: !selected,
      },
      {
        label: 'Pass',
        action: { type: 'PASS_TAKE' },
        primary: false,
        disabled: false,
      },
    ];
  }

  return [];
}

/**
 * The bottom bar: whose turn it is, the decision in front of them, and the two
 * ways to answer it. Every phase offers exactly one committing action and one
 * way out, so the bar never grows a third competing button.
 */
export default function ActionBar({
  state,
  seat,
  selected,
  revealing,
  botDeciding,
  dispatch,
}: {
  state: GameState;
  seat: Player;
  selected: HarbourCard | undefined;
  /** A flipped card is still turning over. */
  revealing: boolean;
  /** The game waits for a bot, so the buttons are replaced with a label. */
  botDeciding: boolean;
  dispatch: (action: Action) => void;
}) {
  const active = state.players[state.active];
  const dry = nothingToDraw(state);
  // Until the card has turned over, the bar stays as it was during the discovery,
  // so the text does not tell what the card is (e.g. "Two ships of one colour").
  const phase = revealing ? 'discovery' : state.phase;
  const actions = actionsFor(
    phase,
    state.harbour.length,
    selected,
    active.name,
    dry,
  );

  return (
    <div className="bg-portRoyal-ink/94 text-portRoyal-ground flex flex-none items-center gap-5 px-6 py-3">
      <div className="flex min-w-52.5 flex-col gap-0.75">
        <span className="font-archivo-narrow text-portRoyal-brassLight text-[10px] tracking-[0.2em] uppercase">
          {PHASE_LABEL[phase] ?? 'Phase · —'}
        </span>
        <span className="font-spectral text-[15px] font-semibold">
          {phase === 'others'
            ? `${seat.name} is buying from ${active.name}`
            : `${active.name}'s turn`}
        </span>
      </div>

      <div className="bg-portRoyal-steel h-8.5 w-px" />

      <div className="font-spectral flex-1 text-[20px] font-medium">
        {question(
          phase,
          state.harbour.length,
          state.takesLeft,
          seat,
          active,
          dry,
        )}
      </div>

      {botDeciding ? (
        // The bot plays its own turn, so the buttons are not shown at all.
        // The label has the same height as a button, so the bar does not jump.
        <div className="font-spectral text-portRoyal-brassLight flex min-h-11 items-center px-5.5 text-[15px] italic">
          {seat.name} is thinking…
        </div>
      ) : (
        <div className="flex gap-2.5">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={a.disabled}
              // Clicks are ignored while a card turns over. The buttons are not
              // disabled, because that would make them blink on every flip.
              onClick={() => !revealing && dispatch(a.action)}
              className={`min-h-11 border px-5.5 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase hover:brightness-[1.08] ${
                a.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${
                a.primary
                  ? a.disabled
                    ? 'border-portRoyal-slate bg-portRoyal-parchment/25 text-portRoyal-wood'
                    : 'border-portRoyal-wood bg-portRoyal-brass text-portRoyal-ink'
                  : 'border-portRoyal-wood text-portRoyal-parchment bg-transparent'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
