import { InferGetServerSidePropsType } from 'next';
import { useEffect, useState } from 'react';
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

  const { data: vesiosuuskunnat, refetch } = useQuery({
    queryKey: MUTATION_AND_QUERY_KEYS.VESIOSUUSKUNNAT,
    queryFn: async () => {
      return (await axios.get('/api/vesiosuuskunta'))
        .data as GetVesiosuuskunta[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  useEffect(() => {
    async function fetchVesiosuuskunnat() {
      try {
        console.log(vesiosuuskunnat);
      } catch (e) {
        handleError(e);
      }
    }
    fetchVesiosuuskunnat();
  }, [vesiosuuskunnat]);

  if (vesiosuuskunnat && vesiosuuskunnat.length <= 0) {
    return (
      <Main user={user}>
        <div className="flex flex-col items-center">
          <Button
            className="mt-1"
            onClick={() => setShowCreateVesiosuuskuntaModal(true)}
          >
            Luo vesiosuuskunta
          </Button>
        </div>
        {showCreateVesiosuuskuntaModal && (
          <CreateVesiosuuskuntaModal
            closeModal={() => {
              setShowCreateVesiosuuskuntaModal(false);
            }}
          />
        )}
      </Main>
    );
  }

  return (
    <Main user={user}>
      <div className="flex flex-col items-center">
        {vesiosuuskunnat?.map((value, index) => {
          return (
            <LinkElement
              href={`/vesiosuuskunta/${value.uuid}`}
              key={`${value.name}${index}`}
              className="min-h-12 min-w-80 rounded-lg bg-green-500 text-center text-2xl font-bold wrap-anywhere text-black"
            >
              {value.name}
            </LinkElement>
          );
        })}
      </div>
    </Main>
  );
}
