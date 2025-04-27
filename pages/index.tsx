import { Button } from '~/components/Button';
import { Main } from '~/components/Main';
import { Topbar } from '~/components/Topbar';
import { getServerSideProps } from '~/utils/getServerSideProps';

// this checks login status
export { getServerSideProps };

export default function Home() {
  return (
    <Main>
      <div className="flex flex-col items-center">
        <Button className="mt-1">Jäsenet</Button>
      </div>
    </Main>
  );
}
