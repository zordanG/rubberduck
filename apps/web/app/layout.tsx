import './globals.css';

import { Roboto } from 'next/font/google';
import type { Metadata } from 'next';
import { Nav } from './ui/nav';
import { Footer } from './ui/footer';

const roboto = Roboto({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rubberduck',
  description:
    'Tem algum problema com seu código? Converse com seu "Rubberduck" e veja a solução que ele irá lhe apresentar;',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={roboto.className}>
      <body className='flex flex-col min-h-screen'>
        <Nav />
        <main className='flex-1 py-16 px-20'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
