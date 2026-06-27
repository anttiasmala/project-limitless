// components/ThemedToastContainer.tsx

'use client';

import { Bounce, ToastContainer } from 'react-toastify';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect, useState } from 'react';

// App-wide toast container, rendered once from the root layout. Reads the theme
// from localStorage so toasts match the user's Dark/Light choice and stay in
// sync (useLocalStorage broadcasts in-tab writes and listens for `storage`).
export default function ThemedToastContainer() {
  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);
  const [isPhoneUser, setIsPhoneUser] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsPhoneUser(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      limit={isPhoneUser ? 1 : 3}
      theme={isDarkTheme ? 'dark' : 'light'}
      transition={Bounce}
    />
  );
}
