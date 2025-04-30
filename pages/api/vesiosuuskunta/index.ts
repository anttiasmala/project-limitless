import { NextApiRequest, NextApiResponse } from 'next/types';
import { requireLogin } from '~/backend/auth/vesiosuuskunta-auth';
import { handleError } from '~/backend/handleError';
import { HttpError } from '~/backend/HttpError';

const HANDLER: Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  GET: handleGET,
  POST: handlePOST,
};

export default async function handleVesiosuuskuntaRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { user: userData } = await requireLogin(req, res);

    const reqHandler = req.method !== undefined && HANDLER[req.method];
    if (reqHandler) {
      await reqHandler(req, res);
    } else {
      throw new HttpError(
        `${req.method} is not a valid method. Only GET and POST requests are valid!`,
        405,
      );
    }
  } catch (e) {
    return handleError(res, e);
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end();
  return;
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end();
  return;
}
