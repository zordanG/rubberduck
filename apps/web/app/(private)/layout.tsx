import { Footer } from '../../components/ui/footer';
import { Nav } from '../../components/ui/nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className='flex-1 py-8 px-4 sm:py-12 sm:px-8 md:py-16 md:px-20'>{children}</main>
      <Footer />
    </>
  );
}
