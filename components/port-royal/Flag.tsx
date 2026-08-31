import { SHIPS } from '@/utils/port-royal/types';
import { twMerge } from 'tailwind-merge';

/**
 * A ship colour's flag. Each colour gets its own silhouette so a duplicate is
 * readable by shape as well as by hue — the duplicate is what ends a discovery
 * phase, so it has to survive colour-blind viewing.
 */
export default function Flag({
  colorIdx,
  className,
}: {
  colorIdx: number;
  className?: string;
}) {
  const ship = SHIPS[colorIdx];

  return (
    <span
      aria-label={`${ship.name} — ${ship.shape} flag`}
      role="img"
      className={twMerge('block flex-none', className)}
      style={{ background: ship.color, clipPath: ship.clip }}
    />
  );
}
