import { NextApiRequest, NextApiResponse } from 'next';
import { HttpError } from '~/backend/HttpError';

export default function Register(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(req.method);
    res.status(200).end();
    return;
  } catch (e) {
    new HttpError('Error occured!', 400);
  }
}
