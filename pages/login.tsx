import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import LinkElement from '~/components/LinkElement';
import { Main } from '~/components/Main';

export default function Register() {
  return (
    <Main>
      <div className="flex flex-col items-center">
        <p className="text-xl font-bold">Kirjaudu sisään</p>
        <form>
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
