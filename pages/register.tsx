import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import LinkElement from '~/components/LinkElement';
import { Main } from '~/components/Main';
import axios from 'axios';
import { FormEvent, useState } from 'react';

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

export default function Register() {
  const [formData, setFormData] = useState<Form>(EMPTY_FORM_DATA);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const request = await axios.post('/api/auth/register', formData);

    if (request) {
      console.log('Everything went through well!');
    }
  }

  return (
    <Main>
      <div className="flex flex-col items-center">
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
          </div>
          <Button
            className="mt-10 w-72 min-w-72 rounded-md p-3 text-black hover:text-blue-500"
            type="submit"
          >
            Rekistöröidy
          </Button>
        </form>

        <LinkElement className="text-sm" href="/login">
          Onko sinulla jo käyttäjä? Kirjaudu sisään!
        </LinkElement>
      </div>
    </Main>
  );
}
