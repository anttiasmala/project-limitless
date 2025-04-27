import { NextApiResponse } from 'next';
import { HttpError } from './HttpError';
import { ZodError } from 'zod';

export function handleError(res: NextApiResponse, e: unknown) {
  if (e instanceof HttpError) {
    return res.status(e.httpStatusCode).send(e.message);
  }

  if (e instanceof ZodError) {
    console.error(e);
    return res.status(400).json(e.issues);
  }
  console.error(e);
  return res.status(500).send('Server error!');
}
