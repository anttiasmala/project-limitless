import { InferGetServerSidePropsType } from 'next';
import { FormEvent, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { GetMember, GetUser, GetVesiosuuskunta, User } from '~/shared/types';
import { getServerSideProps } from '~/utils/getServerSideProps';
import {
  arrayOfNames_debug as arrayOfNames,
  MUTATION_AND_QUERY_KEYS,
} from '~/utils/utils';
import prisma from '~/prisma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import handleError from '~/utils/handleError';
import axios from 'axios';
import CreateVesiosuuskuntaModal from '~/components/CreateVesiosuuskuntaModal';
import LinkElement from '~/components/LinkElement';
import { twMerge } from 'tailwind-merge';
import SvgWaterDrop from '~/icons/water_drop';
import CreateMemberModal from '~/components/CreateNewMemberModal';
import { Input } from '~/components/Input';
import EditModal from '~/components/EditMemberModal';

// this checks login status
export { getServerSideProps };

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateNewMemberModal, setShowCreateNewMemberModal] =
    useState<boolean>(false);
  const [editModalData, setEditModalData] = useState<GetMember | null>(null);
  const [deleteModalData, setDeleteModalData] = useState<GetMember | null>(
    null,
  );

  const [pageUUID, setPageUUID] = useState('');

  useEffect(() => {
    setPageUUID(
      window.location.pathname.match(/vesiosuuskunta\/(.+?)\/members/)?.[1] ??
        '',
    );
    refetch();
    document.body.classList.remove('bg-gray-500');
    document.body.classList.add('bg-gray-200');
    return () => {
      queryClient.clear();
      document.body.classList.remove('bg-gray-200');
      document.body.classList.add('bg-gray-500');
    };
  }, []);

  const { data: members, refetch } = useQuery({
    queryKey: MUTATION_AND_QUERY_KEYS.MEMBERS,
    queryFn: async () => {
      return (await axios.get(`/api/vesiosuuskunta/${pageUUID}/members`))
        .data as GetMember[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: false,
  });

  useEffect(() => {
    console.log(members);
  }, [members]);

  return (
    <main className="h-screen w-screen">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-gray-200">
          <div className="relative">
            <button
              className="absolute z-20 ml-1 font-bold hover:text-blue-500"
              onClick={() => {
                window.history.back();
              }}
            >
              Takaisin
            </button>
          </div>
          <Topbar />
          <div className="grid justify-center">
            {arrayOfNames.map((v, i) => {
              return (
                <div className="m-3 grid border border-black">
                  <p>Sukunimi: {v.lastName}</p>
                  <p>Etunimi: {v.firstName}</p>
                  <p>Katuosoite: {v.streetAddress}</p>
                  <p>Postinro: {v.zipcode}</p>
                  <p>Toimipaikka: {v.city}</p>
                  <p>Puhelin: {v.phoneNumber}</p>
                  <p>S-posti: {v.email}</p>
                  <p>Maksettu: {v.paid}</p>
                  <p>Liittymän nro: {v.connectionPointNumber}</p>
                  <p>Kommenttikenttä: {v.comments}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function TitleParagraph({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('sticky top-0 mb-3 bg-gray-200', className)}>
      {children}
    </div>
  );
}
