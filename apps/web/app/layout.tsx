import './globals.css';

import { Roboto } from 'next/font/google';
import { Nav } from './ui/nav';

const roboto = Roboto({
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={roboto.className}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
