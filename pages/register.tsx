import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import LinkElement from '~/components/LinkElement';
import { Main } from '~/components/Main';
import axios from 'axios';
import { FormEvent, useState } from 'react';
import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  passwordSchema,
} from '~/shared/zodSchemas';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import handleError from '~/utils/handleError';
import { useRouter } from 'next/router';

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const EMPTY_FORM_DATA: Form = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const EMPTY_FORM_ERRORS = EMPTY_FORM_DATA;

export default function Register() {
  const [formData, setFormData] = useState<Form>(EMPTY_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Form>(EMPTY_FORM_ERRORS);
  const [isAccountCreationSuccess, setIsAccountCreationSuccess] =
    useState<boolean>(false);

  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.REGISTER,
    mutationFn: async (formData: Form) =>
      await axios.post('/api/auth/register', formData),
    onSuccess: () => accountCreationSuccess(),
  });

  function accountCreationSuccess() {
    setFormData(EMPTY_FORM_DATA);
    setIsAccountCreationSuccess(true);
    setTimeout(() => {
      router.push('/').catch((e) => console.error(e));
    }, 1000);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      if (!checkFields()) {
        return;
      }
      setFormErrors(EMPTY_FORM_ERRORS);
      await mutateAsync(formData);
    } catch (e) {
      handleError(e);
    }
  }

  /** If returns true all good, if false errors have been found */
  function checkFields() {
    const firstName =
      firstNameSchema.safeParse(formData.firstName).error?.errors[0].message ??
      '';
    const lastName =
      lastNameSchema.safeParse(formData.lastName).error?.errors[0].message ??
      '';
    const email =
      emailSchema.safeParse(formData.email).error?.errors[0].message ?? '';
    const password =
      passwordSchema.safeParse(formData.password).error?.errors[0].message ??
      '';
    setFormErrors(() => ({ firstName, lastName, email, password }));

    // if some of the fields has failed, return false
    if (firstName || lastName || email || password) {
      return false;
    }
    return true;
  }

  return (
    <Main>
      <div className="flex flex-col items-center">
        <div className="max-w-72">
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="mt-2 flex flex-col">
              <label htmlFor="firstName">Etunimi:</label>
              <Input
                name="firstName"
                placeholder="Matti"
                onChange={(e) => {
                  setFormData((otherFormData) => ({
                    ...otherFormData,
                    firstName: e.target.value,
                  }));
                }}
                value={formData.firstName}
              />
              <ErrorText text={formErrors.firstName} />
            </div>
            <div className="mt-2 flex flex-col">
              <label htmlFor="lastName">Sukunimi:</label>
              <Input
                name="lastName"
                placeholder="Meikalainen"
                onChange={(e) => {
                  setFormData((otherFormData) => ({
                    ...otherFormData,
                    lastName: e.target.value,
                  }));
                }}
                value={formData.lastName}
              />
              <ErrorText text={formErrors.lastName} />
            </div>
            <div className="mt-2 flex flex-col">
              <label htmlFor="email">Sähköposti:</label>
              <Input
                name="email"
                placeholder="matti.meikalainen@email.com"
                onChange={(e) => {
                  setFormData((otherFormData) => ({
                    ...otherFormData,
                    email: e.target.value,
                  }));
                }}
                value={formData.email}
              />
              <ErrorText text={formErrors.email} />
            </div>
            <div className="mt-2 flex flex-col">
              <label htmlFor="password">Salasana:</label>
              <Input
                name="password"
                placeholder="**************"
                type="password"
                onChange={(e) => {
                  setFormData((otherFormData) => ({
                    ...otherFormData,
                    password: e.target.value,
                  }));
                }}
                value={formData.password}
              />
              <ErrorText text={formErrors.password} />
            </div>
            <Button
              className="mt-10 w-72 min-w-72 rounded-md p-3 text-black hover:text-blue-500"
              type="submit"
            >
              Rekistöröidy
            </Button>
          </form>
          <LinkElement className="absolute text-sm" href="/login">
            Onko jo käyttäjä? Kirjaudu sisään!
          </LinkElement>
          {isAccountCreationSuccess && (
            <div>
              <div className="absolute top-0 left-0 z-99 h-screen w-full bg-black opacity-80"></div>

              <div className="relative">
                <div className="absolute z-100 grid h-50 w-screen items-center rounded-lg border-4 border-yellow-800 bg-gray-500 md:-right-13 md:w-100">
                  <p className="text-center text-2xl wrap-anywhere">
                    Käyttäjätili luotu onnistuneesti!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
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
