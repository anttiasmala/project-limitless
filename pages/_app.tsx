import '~/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, interactive-widget=resizes-visual"
          />
        </Head>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
