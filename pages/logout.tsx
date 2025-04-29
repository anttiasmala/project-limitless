import { InferGetServerSidePropsType } from 'next';
import { getServerSideProps } from '~/utils/getServerSideProps';

export default function Logout({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {}
