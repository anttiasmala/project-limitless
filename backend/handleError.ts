import { NextApiResponse } from 'next';
import { HttpError } from './HttpError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function handleError(res: NextApiResponse, e: unknown) {
  if (e instanceof HttpError) {
    return res.status(e.httpStatusCode ?? 400).send(e.message);
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2025') {
      const modelName =
        typeof e.meta?.modelName === 'string' ? e.meta?.modelName : 'Record';
      return res.status(404).send(`${modelName} was not found on the server!`);
    }
    if (e.code === 'P2002') {
      const targetName =
        Array.isArray(e.meta?.target) && typeof e.meta.target[0] === 'string'
          ? e.meta.target[0]
          : 'Record';
      return res.status(400).send(`${targetName} was not unique!`);
    }
  }

  if (e instanceof ZodError) {
    console.error(e);
    return res.status(400).json(e.issues);
  }
  console.error(e);
  return res.status(500).send('Server error!');
}
