'use client';

import { TournamentState } from '@/lib/tournament';

type Props = {
  tournament: TournamentState;
  youIcon: string;
  youName: string;
};

type SlotState = 'pending' | 'active' | 'winner' | 'loser';

function Slot({
  icon,
  name,
  state,
}: {
  icon: string;
  name: string;
  state: SlotState;
}) {
  const stateClasses: Record<SlotState, string> = {
    pending:
      'bg-slate-100 border-slate-300 text-slate-500 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-600',
    active:
      'bg-amber-100 border-amber-500 text-slate-800 dark:bg-amber-800/50 dark:border-yellow-400 dark:text-yellow-300 animate-pulse',
    winner:
      'bg-emerald-100 border-emerald-500 text-slate-800 dark:bg-emerald-900/60 dark:border-emerald-500 dark:text-emerald-200',
    loser:
      'bg-slate-200 border-slate-400 text-slate-400 line-through dark:bg-red-950/40 dark:border-red-900 dark:text-red-500',
  };
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 border-2 rounded text-xs whitespace-nowrap ${stateClasses[state]}`}
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
  const { stage, semiOpponent, otherSemiPair, otherSemiWinner, finalOpponent } =
    tournament;

  const userInSemi = stage === 'semi';
  const userWonSemi =
    stage === 'final' || stage === 'champion' || (stage === 'eliminated' && !!finalOpponent);

  const youSemiState: SlotState = userInSemi
    ? 'active'
    : userWonSemi
    ? 'winner'
    : 'loser';

  const semiOppState: SlotState = userInSemi
    ? 'active'
    : userWonSemi
    ? 'loser'
    : 'winner';

  const otherSemiResolved = !!otherSemiWinner;
  const [pairA, pairB] = otherSemiPair;
  const otherSemiAState: SlotState = !otherSemiResolved
    ? 'pending'
    : otherSemiWinner!.id === pairA.id
    ? 'winner'
    : 'loser';
  const otherSemiBState: SlotState = !otherSemiResolved
    ? 'pending'
    : otherSemiWinner!.id === pairB.id
    ? 'winner'
    : 'loser';

  const inFinal = stage === 'final';
  const youInFinal = userWonSemi;
  const youFinalState: SlotState =
    stage === 'champion'
      ? 'winner'
      : stage === 'eliminated' && finalOpponent
      ? 'loser'
      : inFinal
      ? 'active'
      : 'pending';
  const finalOppState: SlotState = !finalOpponent
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
      className="w-full bg-white/70 border-2 border-slate-300 dark:bg-amber-950/30 dark:border-amber-800 rounded-lg p-3"
    >
      <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-amber-500 mb-2">
        🏆 Bracket
      </div>
      <div className="flex items-stretch justify-between gap-2">
        {/* Semis */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-amber-600">
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
            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-amber-600">
              Semi 2
            </p>
            <Slot icon={pairA.icon} name={pairA.name} state={otherSemiAState} />
            <Slot icon={pairB.icon} name={pairB.name} state={otherSemiBState} />
          </div>
        </div>

        {/* Final */}
        <div className="flex flex-col justify-center gap-1 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-amber-600">
            Final
          </p>
          {youInFinal ? (
            <Slot icon={youIcon} name={youName} state={youFinalState} />
          ) : (
            <Slot icon="❓" name="TBD" state="pending" />
          )}
          {finalOpponent ? (
            <Slot
              icon={finalOpponent.icon}
              name={finalOpponent.name}
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
