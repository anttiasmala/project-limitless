import { HTMLAttributes } from 'react';

export function Main({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className="h-screen w-full">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-blue-500 md:w-1/2">{children}</div>
      </div>
    </main>
  );
}
