import type { Metadata } from 'next';
import Test from '@/components/index-page/Index';

export const metadata: Metadata = {
  title: 'index-page',
  description: 'Index page',
};

export default function Index() {
  return (
    <main>
      <Test />
    </main>
  );
}
