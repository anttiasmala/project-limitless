/**
 * This message should be shown only if player runs out of time
 */
export const FORFEIT_MESSAGE = '🏴‍☠️ You ran out of time 🏴‍☠️';

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
