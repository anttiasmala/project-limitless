import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { User } from '~/shared/types';
import { getUserSchema } from '~/shared/zodSchemas';

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ user: User }>> {
  // Return user for now to login page
  return {
    redirect: {
      permanent: false,
      destination: '/login',
    },
  };
}
