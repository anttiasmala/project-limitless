import { Button } from '~/components/Button';
import { Topbar } from '~/components/Topbar';
import { getServerSideProps } from '~/utils/getServerSideProps';

// this checks login status
export { getServerSideProps };

export default function Home() {
  return (
    <main className="h-screen w-full">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-blue-500 md:w-1/2">
          <Topbar></Topbar>
          <div className="flex flex-col items-center">
            <Button className="mt-1">Jäsenet</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
