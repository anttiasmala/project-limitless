import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  WindowsXPSettings,
} from '../../utils/index-page/settings';
import { useLocalStorage } from '../useLocalStorage';

export function useWindowsXPSettings() {
  const [stored, setStored, mounted] = useLocalStorage<
    Partial<WindowsXPSettings>
  >(SETTINGS_KEY, DEFAULT_SETTINGS);

  // Merge over the defaults so a settings object saved before a new option
  // existed still gets that option's default instead of undefined.
  const settings: WindowsXPSettings = { ...DEFAULT_SETTINGS, ...stored };

  return [settings, setStored, mounted] as const;
}
