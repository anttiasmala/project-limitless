import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Main } from '~/components/Main';

export default function Register() {
  return (
    <Main>
      <div className="flex flex-col items-center">
        <form>
          <div className="mt-2 flex flex-col">
            <label htmlFor="firstName">Etunimi:</label>
            <Input name="firstName" placeholder="Matti" />
          </div>
          <div className="mt-2 flex flex-col">
            <label htmlFor="lastName">Sukunimi:</label>
            <Input name="lastName" placeholder="Meikalainen" />
          </div>
          <div className="mt-2 flex flex-col">
            <label htmlFor="email">Sähköposti:</label>
            <Input
              name="email"
              placeholder="matti.meikalainen@email.com"
              className=""
            />
          </div>
          <div className="mt-2 flex flex-col">
            <label htmlFor="password">Salasana:</label>
            <Input name="password" placeholder="**************" />
          </div>
          <Button
            className="mt-10 w-72 min-w-72 rounded-md p-3 text-black hover:text-blue-500"
            type="submit"
          >
            Rekistöröidy
          </Button>
        </form>
      </div>
    </Main>
  );
}
