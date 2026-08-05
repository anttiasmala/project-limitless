import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: undefined | PrismaClient;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
