import { InferGetServerSidePropsType } from 'next';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { GetUser, GetVesiosuuskunta, User } from '~/shared/types';
import { getServerSideProps } from '~/utils/getServerSideProps';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import prisma from '~/prisma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import handleError from '~/utils/handleError';
import axios from 'axios';
import CreateVesiosuuskuntaModal from '~/components/CreateVesiosuuskuntaModal';
import LinkElement from '~/components/LinkElement';

// this checks login status
export { getServerSideProps };

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateVesiosuuskuntaModal, setShowCreateVesiosuuskuntaModal] =
    useState<boolean>(false);

  const initialRender = useRef(true);

  const [pageUUID, setPageUUID] = useState<string>('');
  const [baseURL, setBaseURL] = useState<string>('');

  const { data: vesiosuuskunta, refetch } = useQuery({
    queryKey: MUTATION_AND_QUERY_KEYS.VESIOSUUSKUNTA,
    queryFn: async () => {
      return (await axios.get(`/api/vesiosuuskunta/${pageUUID}`))
        .data as GetVesiosuuskunta;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: false,
  });

  useEffect(() => {
    setPageUUID(window.location.pathname.split('/vesiosuuskunta/')[1] ?? '');
    setBaseURL(window.location.href);
  }, []);

  useEffect(() => {
    async function fetchVesiosuuskunta() {
      try {
        if (initialRender.current === true) {
          initialRender.current = false;
          return;
        }
        await refetch();
        console.log(vesiosuuskunta);
      } catch (e) {
        handleError(e);
      }
    }
    fetchVesiosuuskunta();
  }, [pageUUID, vesiosuuskunta]);

  return (
    <Main user={user}>
      <div className="flex flex-col items-center">
        <LinkElement href={`${baseURL}/members`}>Jäsenet</LinkElement>
      </div>
    </Main>
  );
}
