import Image from 'next/image';

export function Topbar() {
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
