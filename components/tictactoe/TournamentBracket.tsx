'use client';

import { TournamentState } from '@/lib/tictactoe/tournament';

type Props = {
  tournament: TournamentState;
  youIcon: string;
  youName: string;
};

type SlotState = 'pending' | 'active' | 'winner' | 'loser';

const SLOT_CLASSES: Record<SlotState, string> = {
  pending:
    'bg-slate-100 border-slate-300 text-slate-500 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-600',
  active:
    'bg-amber-100 border-amber-500 text-slate-800 dark:bg-amber-800/50 dark:border-yellow-400 dark:text-yellow-300 animate-pulse',
  winner:
    'bg-emerald-100 border-emerald-500 text-slate-800 dark:bg-emerald-900/60 dark:border-emerald-500 dark:text-emerald-200',
  loser:
    'bg-slate-200 border-slate-400 text-slate-400 line-through dark:bg-red-950/40 dark:border-red-900 dark:text-red-500',
};

function Slot({
  icon,
  name,
  state,
}: {
  icon: string;
  name: string;
  state: SlotState;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded border-2 px-2 py-1 text-xs whitespace-nowrap ${SLOT_CLASSES[state]}`}
    >
      <span aria-hidden>{icon}</span>
      <span className="font-semibold">{name}</span>
    </div>
  );
}

export default function TournamentBracket({
  tournament,
  youIcon,
  youName,
}: Props) {
  const { stage, semiOpponent, otherSemiPair, otherSemiWinner } = tournament;

  // The user only reaches the final if they won their semi, so 'final' /
  // 'champion' / 'eliminated-with-otherSemiWinner' all imply a semi win.
  const userPastSemi =
    stage === 'final' ||
    stage === 'champion' ||
    (stage === 'eliminated' && !!otherSemiWinner);
  const inSemi = stage === 'semi';

  const youSemiState: SlotState = inSemi
    ? 'active'
    : userPastSemi
      ? 'winner'
      : 'loser';
  const semiOppState: SlotState = inSemi
    ? 'active'
    : userPastSemi
      ? 'loser'
      : 'winner';

  const [pairA, pairB] = otherSemiPair;
  const otherSemiAState: SlotState = !otherSemiWinner
    ? 'pending'
    : otherSemiWinner.id === pairA.id
      ? 'winner'
      : 'loser';
  const otherSemiBState: SlotState = !otherSemiWinner
    ? 'pending'
    : otherSemiWinner.id === pairB.id
      ? 'winner'
      : 'loser';

  const youFinalState: SlotState =
    stage === 'champion'
      ? 'winner'
      : stage === 'eliminated' && otherSemiWinner
        ? 'loser'
        : stage === 'final'
          ? 'active'
          : 'pending';
  const finalOppState: SlotState = !otherSemiWinner
    ? 'pending'
    : stage === 'champion'
      ? 'loser'
      : stage === 'eliminated'
        ? 'winner'
        : 'active';

  return (
    <div
      role="group"
      aria-label="Tournament bracket"
      className="w-full rounded-lg border-2 border-slate-300 bg-white/70 p-3 dark:border-amber-800 dark:bg-amber-950/30"
    >
      <div className="mb-2 text-center text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-amber-500">
        🏆 Bracket
      </div>
      <div className="flex items-stretch justify-between gap-2">
        {/* Semis */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] tracking-wider text-slate-400 uppercase dark:text-amber-600">
              Semi 1
            </p>
            <Slot icon={youIcon} name={youName} state={youSemiState} />
            <Slot
              icon={semiOpponent.icon}
              name={semiOpponent.name}
              state={semiOppState}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] tracking-wider text-slate-400 uppercase dark:text-amber-600">
              Semi 2
            </p>
            <Slot icon={pairA.icon} name={pairA.name} state={otherSemiAState} />
            <Slot icon={pairB.icon} name={pairB.name} state={otherSemiBState} />
          </div>
        </div>

        {/* Final */}
        <div className="flex flex-1 flex-col justify-center gap-1">
          <p className="text-[10px] tracking-wider text-slate-400 uppercase dark:text-amber-600">
            Final
          </p>
          {userPastSemi ? (
            <Slot icon={youIcon} name={youName} state={youFinalState} />
          ) : (
            <Slot icon="❓" name="TBD" state="pending" />
          )}
          {otherSemiWinner ? (
            <Slot
              icon={otherSemiWinner.icon}
              name={otherSemiWinner.name}
              state={finalOppState}
            />
          ) : (
            <Slot icon="❓" name="TBD" state="pending" />
          )}
        </div>
      </div>
    </div>
  );
}
