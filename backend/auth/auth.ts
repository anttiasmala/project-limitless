// Turns an accidental import from a client component into a build error rather
// than a bundled copy of the Prisma client and the auth secret.

// @backend
import 'server-only';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username } from 'better-auth/plugins';
import prisma from '@/prisma/index';

export const auth = betterAuth({
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
