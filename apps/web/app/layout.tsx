import './globals.css';

import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={roboto.className}>
      <body className='bg-primary text-tertiary'>{children}</body>
    </html>
  );
}
