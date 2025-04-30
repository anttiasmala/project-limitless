import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { GetUser, User } from '~/shared/types';
import { getServerSideProps } from '~/utils/getServerSideProps';

// this checks login status
export { getServerSideProps };

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <Main user={user}>
      <div className="flex flex-col items-center">
        <Button
          className="mt-1"
          onClick={() => {
            router.push('/vesiosuuskunta').catch((e) => console.error(e));
          }}
        >
          Vesiosuuskunta
        </Button>
      </div>
    </Main>
  );
}
