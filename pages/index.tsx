import Image from 'next/image';
import { Button } from '~/components/Button';

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

function Topbar() {
  return (
    <div className="relative flex justify-center">
      <div className="absolute font-bold text-black text-shadow-lg">
        Project Limitless Vesiosuuskunta
      </div>
      <Image
        src={'/water.png'}
        alt="waterdrop"
        className="h-20 w-full md:h-40"
        width={600}
        height={1}
      />
    </div>
  );
}
