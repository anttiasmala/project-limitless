// Turns an accidental import from a client component into a build error rather
// than a bundled copy of the Prisma client and the auth secret.

// @backend
import 'server-only';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username } from 'better-auth/plugins';
import prisma from '@/prisma/index';

// In development the app is reached under more than one host: localhost on this
// machine, and the computer's internal IP when testing from a phone. A single
// hardcoded URL would be wrong
const developmentBaseURL = {
  allowedHosts: [
    'localhost:*',
    '127.0.0.1:*',
    // Same variable next.config.ts passes to allowedDevOrigins, so the phone
    // only needs the one host written down in .env.local.
    ...(process.env.ALLOWED_DEV_ORIGINS
      ? [`${process.env.ALLOWED_DEV_ORIGINS}:*`]
      : []),
  ],
  // Dev is served over plain HTTP
  protocol: 'http' as const,
};

export const auth = betterAuth({
  // Deployments set BETTER_AUTH_URL and get one fixed, unambiguous origin.
  baseURL: process.env.BETTER_AUTH_URL || developmentBaseURL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // Adds the unique `username` column the register form needs, and with it
    // the "username is already taken" answer the form was written to expect.
    // The rules mirror utils/zodSchemas.ts so the same input is accepted on
    // both sides of the request.
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
    }),
  ],
});
