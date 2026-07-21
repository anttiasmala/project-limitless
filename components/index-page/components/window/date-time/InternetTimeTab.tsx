import { useId } from 'react';
import { XP_BUTTON, XP_CHECKBOX, XP_FIELD } from '../xpStyles';
import { TIME_SERVERS, TimeServer } from './constants';

// XP synchronized weekly, so the next attempt is a week after the last one.
const nextSyncDate = (lastSync: Date) => {
  const next = new Date(lastSync);
  next.setDate(next.getDate() + 7);
  return next;
};

type Props = {
  autoSync: boolean;
  onAutoSyncChange: (enabled: boolean) => void;
  server: TimeServer;
  onServerChange: (server: TimeServer) => void;
  // The last completed sync, or null before the user has run one.
  lastSync: { server: TimeServer; at: Date } | null;
  onSync: () => void;
};

export default function InternetTimeTab({
  autoSync,
  onAutoSyncChange,
  server,
  onServerChange,
  lastSync,
  onSync,
}: Props) {
  const autoSyncId = useId();
  const nextSync = lastSync && nextSyncDate(lastSync.at);

  return (
    <div className="flex h-full flex-col">
      <div className="flex">
        <input
          type="checkbox"
          id={autoSyncId}
          checked={autoSync}
          onChange={(e) => onAutoSyncChange(e.target.checked)}
          className={XP_CHECKBOX}
        />
        <label htmlFor={autoSyncId} className="ml-1 text-xs select-none">
          Automatically synchronize with an Internet time server
        </label>
      </div>
      <div className="mt-2 flex items-center justify-center">
        <p className="mr-3 text-xs">Server:</p>
        <select
          className={`${XP_FIELD} cursor-pointer disabled:text-[#a0a0a0]`}
          disabled={!autoSync}
          onChange={(e) => onServerChange(e.target.value as TimeServer)}
          value={server}
        >
          {TIME_SERVERS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          className={`${XP_BUTTON} ml-2`}
          type="button"
          disabled={!autoSync}
          onClick={onSync}
        >
          Update Now
        </button>
      </div>

      <div className="mt-5 text-xs">
        {lastSync ? (
          <p>
            The time has successfully synchronized with {lastSync.server} on{' '}
            {lastSync.at.toLocaleString()}.
          </p>
        ) : (
          <p>This computer is set to synchronize automatically.</p>
        )}
      </div>

      {/* XP anchored these two notes to the bottom of the tab body */}
      <div className="mt-auto pt-5 text-xs">
        {nextSync && (
          <p>
            Next synchronization: {nextSync.toLocaleDateString()} at{' '}
            {nextSync.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        )}
        <p className="mt-2">
          Synchronization can occur only when your computer is connected to the
          Internet. Learn more about{' '}
          <span className="cursor-pointer text-blue-500 underline">
            time synchronization
          </span>{' '}
          in Help and Support Center.
        </p>
      </div>
    </div>
  );
}
