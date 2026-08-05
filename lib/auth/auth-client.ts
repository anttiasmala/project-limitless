import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // No baseURL on purpose: in the browser the client defaults to the page's own
  // origin, so this works in dev and in production without a hardcoded host.
  plugins: [usernameClient()],
});

/**
 * Reads the current session. Re-exported here so components can ask
 * "who is signed in?" without reaching for `authClient` themselves. The same
 * way they get loginUser/registerUser rather than calling it directly.
 */
export const useSession = authClient.useSession;
