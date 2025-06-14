import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { validateRequest } from '~/backend/auth/vesiosuuskunta-auth';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import LinkElement from '~/components/LinkElement';
import { Main } from '~/components/Main';
import { emailSchema } from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';

const EMPTY_ERRORS = {
  email: '',
  password: '',
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookieData = await validateRequest(context.req, context.res);
  if (!cookieData.user || !cookieData.session.isLoggedIn) {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      permanent: false,
      destination: '/',
    },
  };
}

export default function Register() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errors, setErrors] = useState(EMPTY_ERRORS);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.LOGIN,
    mutationFn: async () =>
      await axios.post('/api/auth/login', { email, password }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/').catch((e) => console.error(e));
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setErrors(EMPTY_ERRORS);
      if (!checkIfFieldsOk()) {
        return;
      }

      await mutateAsync();
    } catch (e) {
      handleError(e);
    }
  }

  function checkIfFieldsOk() {
    let errorFound = false;
    if (password.length <= 0) {
      setErrors({ ...errors, password: 'Salasana on pakollinen!' });
      errorFound = true;
    }
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setErrors({
        ...errors,
        email: parsedEmail.error.issues[0].message ?? 'Sähköpostissa on virhe!',
      });
      errorFound = true;
    }

    if (errorFound) return false;

    return true;
  }

  return (
    <Main>
      <div className="flex flex-col items-center">
        <p className="text-xl font-bold">Kirjaudu sisään</p>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="mt-2 flex flex-col">
            <label htmlFor="email">Sähköposti:</label>
            <Input
              name="email"
              placeholder="matti.meikalainen@email.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <ErrorText text={errors.email} />
          </div>
          <div className="mt-2 flex flex-col">
            <label htmlFor="password">Salasana:</label>
            <Input
              name="password"
              placeholder="**************"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <ErrorText text={errors.password} />
          </div>
          <Button
            className="mt-10 w-72 min-w-72 rounded-md p-3 text-black hover:text-blue-500"
            type="submit"
          >
            Kirjaudu sisään
          </Button>
        </form>
        <LinkElement className="text-sm" href="/register">
          Eikö ole käyttäjää? Rekistöröidy!
        </LinkElement>
      </div>
    </Main>
  );
}

function ErrorText({ text }: { text: string }) {
  if (text.length > 0) {
    return <p className="text-red-500">{text}</p>;
  }
  return null;
}
