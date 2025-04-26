import { HTMLAttributes } from 'react';
import { Topbar } from './Topbar';

export function Main({ children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className="h-screen w-full">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-gray-200 md:w-1/2">
          <Topbar />
          {children}
        </div>
      </div>
    </main>
  );
}
