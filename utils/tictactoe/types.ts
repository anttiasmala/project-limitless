// utils/tictactoe/types.ts

import { Player } from '@/lib/gameLogic';

export type GameMode = 'pvp' | 'pvc' | 'watch' | 'tournament';

export enum PlayerNames {
  '☠️' = 'Davy Jones',
  '⚓' = 'Capt. Hook',
}

export type MoveEntry = {
  turn: number;
  player: Player;
  index: number;
};

export const CELL_LABELS: Record<number, string> = {
  0: 'Top left',
  1: 'Top centre',
  2: 'Top right',
  3: 'Middle left',
  4: 'Centre',
  5: 'Middle right',
  6: 'Bottom left',
  7: 'Bottom centre',
  8: 'Bottom right',
};

export enum BestOfSeriesNames {
  'off' = 0,
  'bo3' = 2, // Best of 3 needs only 2 wins
  'bo5' = 3, // Best of 5 needs only 3 wins
}

export type WinLossDrawStats = Record<
  Player,
  { win: number; loss: number; draw: number }
>;

export const INITIAL_WIN_LOSS_DRAW: WinLossDrawStats = {
  '☠️': { win: 0, loss: 0, draw: 0 },
  '⚓': { win: 0, loss: 0, draw: 0 },
};

export type BaseSettingsProps = {
  showSettingsModal: boolean;
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
  AudioArray: React.RefObject<HTMLAudioElement | null>[];
  isAudioMuted: boolean;
  setIsAudioMuted: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isArrowKeysEnabled: boolean;
  setIsArrowKeysEnabled: (value: boolean) => void;
};
