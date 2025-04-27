import { AxiosError } from 'axios';

export default function handleError(e: unknown) {
  if (e instanceof AxiosError) {
    console.error(e);
    console.error(e.response?.data ?? 'Request failed');
    return;
  }
  console.error(e);
}
