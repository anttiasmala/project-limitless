import { InferGetServerSidePropsType } from 'next';
import { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { GetUser, GetVesiosuuskunta, User } from '~/shared/types';
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
    document.body.classList.remove('bg-gray-500');
    document.body.classList.add('bg-gray-200');
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
    <main className="h-screen w-screen">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-gray-200">
          <Topbar />
          <div className="flex flex-col items-center">
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-row justify-evenly">
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Sukunimi
                  </TitleParagraph>
                  {arrayOfNames.map((v, i) => {
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

                  {arrayOfNames.map((v, i) => {
                    return <p key={`${v.firstName}${i}`}>{v.firstName}</p>;
                  })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Katuosoite
                  </TitleParagraph>

                  {arrayOfNames.map((v, i) => {
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

                  {arrayOfNames.map((v, i) => {
                    return <p key={`${v.zipcode}${i}`}>{v.zipcode}</p>;
                  })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Toimipaikka
                  </TitleParagraph>

                  {arrayOfNames.map((v, i) => {
                    return <p key={`${v.city}${i}`}>{v.city}</p>;
                  })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    Puhelinnro
                  </TitleParagraph>

                  {arrayOfNames.map((v, i) => {
                    return (
                      <p key={`${v.phoneNumber}${i}`} className="mr-3 lg:mr-0">
                        {v.phoneNumber}
                      </p>
                    );
                  })}
                </div>
                <div>
                  <TitleParagraph className="sticky top-0 mb-3 bg-gray-200">
                    S-posti
                  </TitleParagraph>

                  {arrayOfNames.map((v, i) => {
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
                  {arrayOfNames.map((v, i) => {
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

                  {arrayOfNames.map((v, i) => {
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

                  {arrayOfNames.map((v, i) => {
                    return (
                      <div>
                        <p key={`${v.comments}${i}`}>-</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <TitleParagraph>
                    Muokkaa/Poista
                    {arrayOfNames.map((v, i) => {
                      return (
                        <div key={`${v.comments}${i + 1}`}>
                          <div className="relative">
                            <button
                              className="m-0 p-0"
                              onClick={() => {
                                console.log('Muokkaa:', arrayOfNames[i]);
                              }}
                            >
                              <SvgWaterDrop
                                width={24}
                                height={24}
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
                                width={24}
                                height={24}
                                className="bg-red-500"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </TitleParagraph>
                </div>
                <button className="absolute top-140 right-1/5">
                  <SvgWaterDrop width={128} height={128} />
                </button>
              </div>
            </div>
            <div className="flex w-full flex-row"></div>
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
