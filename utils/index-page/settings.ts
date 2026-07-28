// User-adjustable settings for the Windows XP desktop, edited in the Settings
// window and persisted in localStorage under SETTINGS_KEY.

export type WindowsXPSettings = {
  // When false, right-clicking the desktop leaves the browser's own menu alone,
  // so images and icons can be saved/copied normally.
  enableCustomContextMenu: boolean;
};

export const SETTINGS_KEY = 'windowsXP';

// The values a first-time visitor gets
export const DEFAULT_SETTINGS: WindowsXPSettings = {
  enableCustomContextMenu: true,
};
