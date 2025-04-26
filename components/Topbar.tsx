import Image from 'next/image';
import { useRouter } from 'next/router';

export function Topbar() {
  const router = useRouter();

  return (
    <div className="relative flex justify-center">
      <div className="absolute font-bold text-black text-shadow-lg">
        <button
          onClick={() => {
            router.push('/').catch((e) => console.error(e));
          }}
        >
          Project Limitless Vesiosuuskunta
        </button>
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
