# Computer vs Computer — "Watch Mode" Spec

A "watch" mode where two AIs play each other automatically, designed to be fun
to observe with the existing storm/kraken animations.

Each decision below was resolved during a design interview. Numbers reflect the
order decisions were made (gaps are intentional — grouped by topic here).

## Mode model

1. **Third top-level mode.** `mode: 'pvp' | 'pvc' | 'watch'`. New `👀 Watch`
   button added to `ModeSelector` alongside `⚔️ Two Pirates` / `🤖 Vs the Kraken`.
2. **Two difficulty pickers**, one per AI side.
5. **Kraken/storm semantics stay `⚓`-centric.** No changes to
   `getKrakenMood` or `getStormLevel`. The kraken is the "home team"; `⚓` is its
   champion, `☠️` the challenger. Storm rages when `⚓` wins, calm when it loses —
   same emotional beats as PvC.

## Controls

3b. **Three speed buttons** — Slow / Normal (default ~800ms) / Fast — styled
   like `DifficultySelector`.
11. **Pause toggle** (`⏸️` ↔ `▶️`) inline with the speed buttons. Freezes
   mid-game by clearing the next scheduled move's timeout; resume picks up from
   the frozen position.
16. **Pickers labeled by icon + name** (`☠️ Davy Jones` / `⚓ Capt. Hook`,
   from localStorage). Fixed mapping: `☠️ → difficultyOne`, `⚓ → difficultyTwo`,
   independent of who starts.
17. **Speed + difficulty changes apply on the next move.** The loop reads both
   fresh from state each move — no snapshotting at game start. A "half-and-half"
   game is acceptable in a spectacle feature.
18. **`🏴‍☠️ New Voyage` = skip to next game.** Abandons the current game, resets
   the board, alternates the starter, loop continues. Score keeps climbing
   across skips. If paused, stays paused (loads a fresh empty board to resume into).

## The loop

4. **Auto-restart loop** with a ~2s breathing pause on game-over (so the winning
   line + kraken `victorious`/`defeated` mood + storm peak register before reset).
   Runs until the user pauses or switches mode.
12. **Armed but not running** until the user taps a starter via `StarterPicker`
   — mirrors PvC. Lets the user set up both difficulties before games begin.
7. **`StarterPicker` visible.** User picks the first starter; starter
   auto-alternates each game (reuses existing logic; fair over the loop).
9. **Tie-breaking randomness added to `getBestMove`** — when multiple moves
   share the top score, pick one at random. Keeps the AI optimal (never loses)
   but varies games so `hard` vs `hard` isn't the same forced draw forever.
   Benefits PvC too.

## Persistence & stats

6. **In-session scoreboard only.** Resets to 0–0 on entering Watch mode. No
   localStorage score writes, no `winLossDraw` updates, no win-streak badges,
   no `SeriesWinnerModal`. Avoids polluting the human's stats and prevents an
   overnight loop from inflating numbers.
13. **Persist Watch settings** (speed, both difficulties) via
   `useGameSettings` / `useLocalStorage` (`watchSpeed`, `watchDifficultyOne`,
   `watchDifficultyTwo`). Board + scoreboard reset on mode switch.
14. **Full settings modal shown unchanged.** Irrelevant toggles (timer, audio,
   bestOfSeries, arrow keys) stay visible but inert — no conditional UI, no
   perturbation of PvC/PvP settings. `handleScores` does **not** fire in Watch
   mode regardless of `pointSystem`; the scoreboard climbs freely.

## Audio / accessibility / wording

10. **Watch mode muted unconditionally** — no `creak`/`cannon`/`splash`
   regardless of the audio setting. A cannon every few seconds would turn
   ambient into hostile; visual animations are the focus.
19. **Side-specific "thinking" flavor.** `⚓` "stirs in the deep…"; `☠️` gets
   pirate-flavored text (e.g. "plots a course…"). `GameStatus`'s `aiThinking`
   branch is parameterized by `currentPlayer` instead of hardcoded `playerTwo`.
   The `mode` prop type widens to include `'watch'`.
20. **`aria-live` suppressed in Watch mode** — status still renders visually,
   but the live-region roles are dropped (an infinite loop would flood a screen
   reader). One-time "Watch mode started" announcement when the loop begins.

## Code structure

15. **Extract a `useWatchMode` hook** owning speed / pause / dual-difficulty
   state and a *separate* move loop. Board.tsx keeps the rendering and passes in
   the shared setters. The existing PvC auto-move effect stays untouched (slight
   logic duplication in win/draw/score bookkeeping, accepted for cleaner
   separation).
8. **UI gating** when `mode === 'watch'`:

   | Element | Watch mode behavior |
   |---|---|
   | Multiplayer button | shown |
   | `ModeSelector` | 3 buttons (`⚔️` / `🤖` / `👀 Watch`) |
   | `DifficultySelector` | two pickers, one per side |
   | Speed buttons + Pause | NEW, inline group |
   | `ScoreBoard` | shown, in-session only |
   | Win-streak badge | hidden |
   | `StarterPicker` | shown |
   | `GameStatus` | side-specific, no "your turn" |
   | `KrakenAvatar` | shown |
   | `HourglassTimer` | hidden (no human turn) |
   | Grid `Square`s | non-interactive (no click/keyboard/swipe), styled disabled |
   | `SeriesWinnerModal` | hidden |
   | `Undo` | hidden (already PvP-only) |
   | `🏴‍☠️ New Voyage` | shown — acts as "skip current game" |
   | `▶ Replay game` | shown |
   | `MoveHistory` sidebar | shown |
   | Settings modal | shown unchanged (incl. Player Settings panel) |

## Minor decisions (not formally questioned)

- **Idle armed state:** before the first starter tap, the board is empty and the
  status shows a "pick a crew to begin" prompt (mirrors PvC).
- **Grid in Watch:** no click handler, no keyboard/swipe nav; `Square`s rendered
  disabled-but-styled so moves still animate in.
