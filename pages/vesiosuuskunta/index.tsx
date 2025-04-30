import { InferGetServerSidePropsType } from 'next';
import { useEffect } from 'react';
import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { GetUser, User } from '~/shared/types';
import { getServerSideProps } from '~/utils/getServerSideProps';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import prisma from '~/prisma';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import handleError from '~/utils/handleError';

// this checks login status
export { getServerSideProps };

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.LOGIN,
    mutationFn: async () =>
      await axios.
    onSuccess: () => {
      queryClient.clear();
      router.push('/').catch((e) => console.error(e));
    },
  });

  useEffect(() => {
    async function fetchVesiosuuskunnat() {
      try {
        await mutateAsync();
      } catch (e) {
        handleError(e);
      }
    }
    fetchVesiosuuskunnat();
  }, []);

  return (
    <Main user={user}>
      <div className="flex flex-col items-center">
        <Button className="mt-1">Jäsenet</Button>
      </div>
    </Main>
  );
}
