// components/ThemedToastContainer.tsx

'use client';

import { Bounce, ToastContainer } from 'react-toastify';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// App-wide toast container, rendered once from the root layout. Reads the theme
// from localStorage so toasts match the user's Dark/Light choice and stay in
// sync (useLocalStorage broadcasts in-tab writes and listens for `storage`).
export default function ThemedToastContainer() {
  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);
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
      limit={3}
      theme={isDarkTheme ? 'dark' : 'light'}
      transition={Bounce}
    />
  );
}
