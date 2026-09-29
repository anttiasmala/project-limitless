import { useLocalStorage } from '../useLocalStorage';
import {
  DEFAULT_SETTINGS,
  Settings,
  SETTINGS_KEY,
} from '@/utils/port-royal/types';

export function usePortRoyalSettings() {
  const [stored, setStored, mounted] = useLocalStorage<Partial<Settings>>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
  );

  // Merge over the defaults so a settings object saved before a new option
  // existed still gets that option's default instead of undefined.
  const settings: Settings = { ...DEFAULT_SETTINGS, ...stored };

  return [settings, setStored, mounted] as const;
}
