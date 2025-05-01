import { HTMLAttributes } from 'react';
import { Topbar } from './Topbar';
import { GetUser } from '~/shared/types';
import LinkElement from './LinkElement';

interface Main extends HTMLAttributes<HTMLDivElement> {
  user?: GetUser;
}

export function Main({ user, ...rest }: Main) {
  if (user) return withLogoutButton({ ...rest });

  return withoutButton({ ...rest });
}

function withLogoutButton({ children }: Main) {
  return (
    <main className="h-screen w-full">
      <div className="flex h-full w-full justify-center">
        <div className="w-full bg-gray-200 md:w-1/2">
          <div className="relative grid justify-items-end">
            <LinkElement
              href="/logout"
              className="absolute z-20 m-0 mr-3 p-0 text-end hover:text-blue-500"
            >
              Kirjaudu ulos
            </LinkElement>
          </div>
          <Topbar className="z-10" />
          {children}
        </div>
      </div>
    </main>
  );
}

function withoutButton({ children }: Main) {
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
