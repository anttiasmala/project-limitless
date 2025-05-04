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
import SvgPlus from '~/icons/plus';
import SvgFile from '~/icons/file';
import DeleteModal from '~/components/DeleteMemberModal';

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
      return (await axios.get(`/api/members`)).data as GetMember[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
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
          <div className="grid grid-cols-2 justify-center wrap-anywhere md:grid-cols-4">
            {members?.map((member, index) => {
              return (
                <div
                  key={`parentDiv${index}`}
                  className="m-3 grid border border-black"
                >
                  <BoxParagraph question="Sukunimi" answer={member.lastName} />
                  <BoxParagraph question="Etunimi" answer={member.firstName} />
                  <BoxParagraph
                    question="Katuosoite"
                    answer={member.streetAddress || '-'}
                  />
                  <BoxParagraph
                    question="Postinumero"
                    answer={member.zipCode || '-'}
                  />
                  <BoxParagraph
                    question="Toimipaikka"
                    answer={member.city || '-'}
                  />
                  <BoxParagraph
                    question="Puhelinnumero"
                    answer={member.phoneNumber || '-'}
                  />
                  <BoxParagraph question="Sähköposti" answer={member.email} />
                  <BoxParagraph
                    question="Maksettu"
                    answer={member.paid || '-'}
                  />
                  <BoxParagraph
                    question="Liittymänumero"
                    answer={member.connectionPointNumber || '-'}
                  />
                  <BoxParagraph
                    question="Kommenttikenttä"
                    answer={member.comment || '-'}
                  />

                  <div className="grid justify-center">
                    <button
                      className="row-start-1 bg-green-500"
                      onClick={() => {
                        setEditModalData(member);
                      }}
                    >
                      <SvgFile width={24} />
                    </button>
                    <button
                      className="row-start-1 w-6 bg-red-500"
                      onClick={() => {
                        setDeleteModalData(member);
                      }}
                    >
                      P
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            <button
              className="absolute bottom-0 left-10/12 border-8 border-green-500"
              onClick={() => {
                setShowCreateNewMemberModal(true);
              }}
            >
              <SvgPlus width={128} />
            </button>
          </div>

          {editModalData && (
            <EditModal
              closeModal={() => setEditModalData(null)}
              memberData={editModalData}
            />
          )}
          {deleteModalData && (
            <DeleteModal
              closeModal={() => setDeleteModalData(null)}
              memberData={deleteModalData}
            />
          )}
          {showCreateNewMemberModal && (
            <CreateMemberModal
              closeModal={() => setShowCreateNewMemberModal(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function BoxParagraph({
  answer,
  question,
}: {
  question: string;
  answer: string;
}) {
  return (
    <p>
      {question}: <span className="font-bold">{answer}</span>
    </p>
  );
}
