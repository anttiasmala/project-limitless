import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SvgWaterDrop from '~/icons/water_drop';
import { getServerSideProps } from '~/utils/getServerSideProps';
import handleError from '~/utils/handleError';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';

export default function Logout({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.LOGIN,
    mutationFn: async () => await axios.post('/api/auth/logout'),

    onSuccess: () => {
      queryClient.clear();
      router.push('/login').catch((e) => console.error(e));
    },
  });

  useEffect(() => {
    async function logout() {
      try {
        await mutateAsync();
      } catch (e) {
        handleError(e);
        router.push('/login').catch((e) => console.error(e));
      }
    }
    logout();
  }, []);

  return (
    <main className="h-screen w-full">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-gray-200 md:w-1/2">
          <div className="relative mt-1 mb-20 flex flex-row justify-center">
            <button className="relative">
              <SvgWaterDrop width={100} height={100} />
              <span className="absolute -left-13 w-max text-xl font-bold shadow-xl">
                PROJECT LIMITLESS
              </span>
            </button>
          </div>
          <div className="grid text-center text-3xl font-bold">
            <div>Kirjaudutaan ulos...</div>
          </div>
        </div>
      </div>
    </main>
  );
}
