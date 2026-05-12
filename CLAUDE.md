# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (both must run simultaneously)
npm run dev          # Next.js frontend on localhost:3000
npx partykit dev     # PartyKit multiplayer backend

# Type checking & linting
npm run check-types
npm run lint
npm run lint:fix

# Build
npm run build

# Convert SVG icons (from public/images/icons/ → icons/)
npm run svgr
```

There are no automated tests in this project.

## Architecture

This is a pirate-themed Tic-Tac-Toe game built with **Next.js 16 (App Router)** and **PartyKit** for real-time multiplayer. Players are ☠️ (Davy Jones / `HUMAN`) and ⚓ (Capt. Hook / `AI`).

### Game Modes
- **PvC (Player vs Computer)** — single-player with easy/medium/hard AI
- **PvP (Player vs Player)** — local two-player on the same device
- **Multiplayer** — real-time via PartyKit WebSockets

### Key files

| Path | Purpose |
|------|---------|
| [lib/gameLogic.ts](lib/gameLogic.ts) | Core game rules: `calculateWinner`, `isDraw`, AI logic (minimax for hard, heuristic for medium, random for easy) |
| [party/game.ts](party/game.ts) | PartyKit server — manages `RoomState`, handles WebSocket messages (`make-move`, `request-rematch`, `init-settings`), enforces turn timers |
| [party/lobby.ts](party/lobby.ts) | Lobby party — tracks active rooms for the multiplayer room browser |
| [utils/multiplayer/multiplayerTypes.ts](utils/multiplayer/multiplayerTypes.ts) | Shared types: `RoomState`, `ClientMessage`, `ServerMessage`, `DEFAULT_ROOM_SETTINGS` |
| [utils/types.ts](utils/types.ts) | Shared frontend types: `PlayerNames`, `MoveEntry`, `BestOfSeriesNames`, `BaseSettingsProps` |
| [utils/stormLevel.ts](utils/stormLevel.ts) | Derives 0–1 storm intensity from board state (drives `OceanBackground` animation) |
| [utils/krakenMood.ts](utils/krakenMood.ts) | Derives kraken emotion from game state (drives `KrakenAvatar` animation) |
| [components/GameContainer.tsx](components/GameContainer.tsx) | Root component for single-player/PvP — owns persisted scores, passes storm level to `OceanBackground` |
| [hooks/useGameSettings.ts](hooks/useGameSettings.ts) | Central hook for all localStorage-backed settings (mute, volume, timer, arrow keys, point system, best-of-series) |

### Data flow

- `GameContainer` (or the multiplayer equivalent) owns score state and passes it down to `Board`.
- `Board` drives the game loop for PvC/PvP; for multiplayer, the PartyKit server is authoritative and `Board` receives `RoomState` via WebSocket.
- Visual theming (storm, kraken) is derived from game state via pure utility functions in `utils/`.
- All user preferences are persisted in `localStorage` via `useLocalStorage` / `useGameSettings`.

### Scoring & series system

Round wins accumulate. When a player reaches 5 round wins, a **series point** is earned and round scores reset. Best-of-3/5 modes track series points; when the series threshold is reached a `SeriesWinnerModal` is shown. This logic lives in both `party/game.ts` (multiplayer) and `Board.tsx` (single-player/PvP).

### PartyKit deployment

`partykit.json` defines the project name (`pirate-tictactoe-party`) with `party/game.ts` as the main party and `party/lobby.ts` as the `lobby` named party. Both can import from `@/lib/` and `@/utils/` using the same path aliases as the frontend.
