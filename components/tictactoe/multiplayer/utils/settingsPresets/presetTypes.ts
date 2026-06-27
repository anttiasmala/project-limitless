import type { RoomSettings } from '@/utils/multiplayer/multiplayerTypes';

export type PresetType = {
  /** Stable identifier, used as the React key and for edit/delete. */
  id: string;
  name: string;
  settings: RoomSettings;
};
