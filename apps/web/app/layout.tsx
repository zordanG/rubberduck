import './globals.css';

import { Roboto, Geist } from 'next/font/google';
import type { Metadata } from 'next';
import { Nav } from '../components/nav';
import { Footer } from '../components/footer';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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
    <html lang='en' suppressHydrationWarning className={cn(roboto.className, 'font-sans', geist.variable)}>
      <body className='flex flex-col min-h-screen'>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <Nav />
          <main className='flex-1 py-8 px-4 sm:py-12 sm:px-8 md:py-16 md:px-20'>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
