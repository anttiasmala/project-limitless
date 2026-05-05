// utils/types.ts

import { Player } from '@/lib/gameLogic';

// UTILS
export type KeyboardEventKeys =
  | ' ' // Space
  | '!'
  | '@'
  | '#'
  | '$'
  | '%'
  | '^'
  | '&'
  | '*'
  | '('
  | ')'
  | '_'
  | '+'
  | '-'
  | '='
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'Backspace'
  | 'Tab'
  | 'Enter'
  | 'Shift'
  | 'Control'
  | 'Alt'
  | 'Pause/Break'
  | 'Caps Lock'
  | 'Escape'
  | 'Space'
  | 'Page Up'
  | 'Page Down'
  | 'End'
  | 'Home'
  | 'ArrowLeft'
  | 'ArrowUp'
  | 'ArrowRight'
  | 'ArrowDown'
  | 'Insert'
  | 'Delete'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'Num Lock'
  | 'Scroll Lock';

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

export type GridMeasurement = {
  cellSize: number;
  gap: number;
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
