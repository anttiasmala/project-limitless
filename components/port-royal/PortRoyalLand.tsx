'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Flag from '@/components/port-royal/Flag';
import {
  BOARD_NOISE,
  BOARD_VIGNETTE,
  DASHED_RULE,
} from '@/components/port-royal/shapes';
import {
  NAME_MAX,
  DEFAULT_SEATS,
  SEAT_OPTIONS,
  normaliseRoster,
  rosterQuery,
} from '@/lib/port-royal/roster';
import {
  DEFAULT_NAMES,
  GameMode,
  MAX_PLAYERS,
  TARGET_VP,
} from '@/utils/port-royal/types';

type Mode = {
  id: GameMode;
  title: string;
  description: string;
  /** Borrows a ship colour's flag, so each tile is identifiable by shape too. */
  colorIdx: number;
  ready: boolean;
};

const MODES: Mode[] = [
  {
    id: 'hotseat',
    title: 'Hotseat',
    description: 'Two to five players around one device.',
    colorIdx: 0,
    ready: true,
  },
  {
    id: 'ai',
    title: 'Versus the AI',
    description: 'Take the game against computer (AI). Not implemented yet.',
    colorIdx: 3,
    ready: false,
  },
  {
    id: 'online',
    title: 'Multiplayer',
    description:
      'Multiplayer. Play against other players online. Not implemented yet.',
    colorIdx: 1,
    ready: false,
  },
];

/** Small caps label, as used on the board's panels. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-archivo-narrow text-portRoyal-wood text-[11px] tracking-[0.24em] uppercase">
      {children}
    </div>
  );
}

export default function PortRoyalLand() {
  const router = useRouter();

  const [mode, setMode] = useState<GameMode>('hotseat');
  const [seats, setSeats] = useState(DEFAULT_SEATS);

  // Every seat is kept, not just the visible ones, so shrinking the table and
  // growing it again does not throw away a name somebody typed.
  const [names, setNames] = useState<string[]>(() =>
    Array<string>(MAX_PLAYERS).fill(''),
  );

  const chosen = MODES.find((m) => m.id === mode)!;

  function setSail() {
    const roster = normaliseRoster(names.slice(0, seats));
    router.push(`/port-royal/local?${rosterQuery(roster)}`);
  }

  return (
    <div
      className="bg-portRoyal-ground font-archivo text-portRoyal-ink relative flex min-h-0 w-full flex-col overflow-hidden"
      style={{ backgroundImage: `${BOARD_VIGNETTE}, ${BOARD_NOISE}` }}
    >
      {/* Compass rose, purely decorative — the board draws the same one. */}
      <div className="border-portRoyal-wood/35 pointer-events-none absolute -bottom-40 -left-32 h-115 w-115 rounded-full border opacity-50">
        <div className="border-portRoyal-wood/30 absolute inset-17.5 rounded-full border" />
      </div>

      <header className="bg-portRoyal-ink text-portRoyal-ground relative flex flex-none items-center gap-4.5 px-6 py-3">
        <div className="flex flex-col justify-center">
          <div className="font-spectral text-[19px] font-semibold tracking-[0.04em]">
            Port Royal
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-y-auto px-6 py-9">
        <div className="flex w-full max-w-5xl flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="font-spectral text-[34px] leading-tight font-semibold">
              Choose your table
            </h1>
            <p className="text-portRoyal-slate max-w-2xl text-[14px] leading-[1.6]">
              Push your luck in the harbour, hire the crew you can afford, and
              be first to {TARGET_VP} victory points.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Game mode"
            className="grid gap-4 md:grid-cols-3"
          >
            {MODES.map((m) => {
              const active = mode === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(m.id)}
                  className={`relative flex cursor-pointer flex-col items-start gap-3 border p-5 pr-16 text-left transition-colors ${
                    active
                      ? 'border-portRoyal-brass bg-portRoyal-card'
                      : 'border-portRoyal-wood/40 bg-portRoyal-parchment/50 hover:border-portRoyal-wood'
                  }`}
                >
                  <Flag colorIdx={m.colorIdx} className="h-5 w-9" />

                  <div className="font-spectral text-[21px] font-semibold">
                    {m.title}
                  </div>

                  <p className="text-portRoyal-slate text-[13px] leading-[1.55]">
                    {m.description}
                  </p>

                  {!m.ready && (
                    <span className="font-archivo-narrow border-portRoyal-wood/55 text-portRoyal-wood absolute top-4 right-4 border px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="border-portRoyal-wood/40 bg-portRoyal-vellum flex flex-col gap-5 border p-6">
            {chosen.ready ? (
              <>
                <div className="flex items-center gap-3">
                  <Label>Seats</Label>
                  <div
                    className="h-px flex-1"
                    style={{ background: DASHED_RULE }}
                  />
                </div>

                <div
                  role="group"
                  aria-label="Number of players"
                  className="flex gap-2"
                >
                  {SEAT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={seats === n}
                      onClick={() => setSeats(n)}
                      className={`min-h-11 w-11 cursor-pointer border text-[15px] font-semibold transition-colors ${
                        seats === n
                          ? 'border-portRoyal-wood bg-portRoyal-brass text-portRoyal-ink'
                          : 'border-portRoyal-wood/40 bg-portRoyal-card text-portRoyal-slate hover:border-portRoyal-wood'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: seats }, (_, i) => (
                    <label key={i} className="flex flex-col gap-1.5">
                      <span className="font-archivo-narrow text-portRoyal-wood text-[10px] tracking-[0.2em] uppercase">
                        Seat {i + 1}
                      </span>
                      <input
                        value={names[i]}
                        onChange={(e) =>
                          setNames((prev) =>
                            prev.map((_name, _index) =>
                              _index === i ? e.target.value : _name,
                            ),
                          )
                        }
                        maxLength={NAME_MAX}
                        placeholder={DEFAULT_NAMES[i]}
                        className="border-portRoyal-wood/40 bg-portRoyal-card text-portRoyal-ink placeholder:text-portRoyal-slate/55 focus:border-portRoyal-brass min-h-11 border px-3 py-2 text-[14px] outline-none"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={setSail}
                    className="bg-portRoyal-brass text-portRoyal-ink border-portRoyal-wood min-h-13 cursor-pointer border px-8.5 py-4 text-[13px] font-semibold tracking-[0.14em] uppercase hover:bg-[#946c28]"
                  >
                    Set sail
                  </button>
                  <p className="text-portRoyal-slate text-[12px]">
                    Blank seats sail under the name shown in the box.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Label>Not yet chartered</Label>
                  <div
                    className="h-px flex-1"
                    style={{ background: DASHED_RULE }}
                  />
                </div>

                <p className="text-portRoyal-slate max-w-2xl text-[14px] leading-[1.6]">
                  {chosen.title} is still being built. Hotseat is playable
                  today, and plays the full game.
                </p>

                <button
                  type="button"
                  onClick={() => setMode('hotseat')}
                  className="hover:bg-portRoyal-brass border-portRoyal-wood text-portRoyal-ink min-h-11 w-fit cursor-pointer border px-5 py-2.5 text-[12px] font-semibold tracking-[0.14em] uppercase"
                >
                  Back to hotseat
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
