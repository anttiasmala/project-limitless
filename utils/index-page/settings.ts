// User-adjustable settings for the Windows XP desktop, edited in the Settings
// window and persisted in localStorage under SETTINGS_KEY.

export type WindowsXPSettings = {
  // When false, right-clicking the desktop leaves the browser's own menu alone,
  // so images and icons can be saved/copied normally.
  enableCustomContextMenu: boolean;
  // When false, the "← Home" link back to the arcade landing page is hidden, so
  // it can't cover a maximized window in the desktop's top left corner.
  enableHomeButton: boolean;
};

export const SETTINGS_KEY = 'windowsXP';

// The values a first-time visitor gets
export const DEFAULT_SETTINGS: WindowsXPSettings = {
  enableCustomContextMenu: true,
  enableHomeButton: true,
};
