import { InferGetServerSidePropsType } from 'next';
import { HTMLAttributes, useEffect, useRef, useState } from 'react';
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

// this checks login status
export { getServerSideProps };

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateNewMemberModal, setShowCreateNewMemberModal] =
    useState<boolean>(false);

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
          <div className="flex flex-col items-center">
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-row justify-evenly">
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Sukunimi
                  </TitleParagraph>
                  {members &&
                    members.map((v, i) => {
                      return (
                        <p key={`${v.lastName}${i}`} className="static">
                          {v.lastName}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Etunimet
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return <p key={`${v.firstName}${i}`}>{v.firstName}</p>;
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Katuosoite
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return (
                        <p
                          key={`${v.streetAddress}${i}`}
                          className="mr-3 lg:mr-0"
                        >
                          {v.streetAddress}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Postinro
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return <p key={`${v.zipCode}${i}`}>{v.zipCode}</p>;
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Toimipaikka
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return <p key={`${v.city}${i}`}>{v.city}</p>;
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Puhelinnro
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return (
                        <p
                          key={`${v.phoneNumber}${i}`}
                          className="mr-3 lg:mr-0"
                        >
                          {v.phoneNumber}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    S-posti
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return (
                        <p key={`${v.email}${i}`} className="mr-3 lg:mr-0">
                          {v.email}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Maksettu
                  </TitleParagraph>
                  {members &&
                    members.map((v, i) => {
                      return (
                        <p key={`${v.paid}${i}`} className="mr-3 lg:mr-0">
                          {v.paid}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Liittymännro
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return (
                        <p key={`${v.connectionPointNumber}${i}`}>
                          {v.connectionPointNumber}
                        </p>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Kommentit
                  </TitleParagraph>

                  {members &&
                    members.map((v, i) => {
                      return (
                        <div key={`${v.comment}${i}`}>
                          <p>-</p>
                        </div>
                      );
                    })}
                </div>
                <div>
                  <TitleParagraph>Muokkaa/Poista</TitleParagraph>
                  {members &&
                    members.map((v, i) => {
                      return (
                        <div key={`${v.comment}${i + 1}`}>
                          <div className="relative">
                            <button
                              className="m-0 p-0"
                              onClick={() => {
                                console.log('Muokkaa:', arrayOfNames[i]);
                              }}
                            >
                              <SvgWaterDrop
                                width={18}
                                height={18}
                                className="bg-green-500"
                              />
                            </button>
                            <button
                              className="m-0 ml-2 p-0"
                              onClick={() => {
                                console.log('Poista:', arrayOfNames[i]);
                              }}
                            >
                              <SvgWaterDrop
                                width={18}
                                height={18}
                                className="bg-red-500"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <button
                  className="absolute top-140 right-1/5 h-0 w-0"
                  onClick={() => {
                    setShowCreateNewMemberModal(true);
                  }}
                >
                  <SvgWaterDrop width={128} height={128} />
                </button>
              </div>
            </div>
            {showCreateNewMemberModal && (
              <CreateMemberModal
                closeModal={() => setShowCreateNewMemberModal(false)}
              />
            )}
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
