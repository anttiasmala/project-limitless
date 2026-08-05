import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 no longer accepts `url` inside the `datasource` block in
// schema.prisma, and its CLI no longer loads `.env` files on its own.
// Next.js still loads these at runtime, so this is only for the CLI
// (migrate, db push, studio). `.env.local` last, to match Next's precedence.
for (const file of ['.env', '.env.local']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
