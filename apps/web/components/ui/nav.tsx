'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { UserProfile } from '@/components/user-profile';
import { Settings } from '@/components/settings';
import { logoutUser } from '@/app/actions/auth';
import Logo from '../logo';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();

    router.replace('/login');
  };

  return (
    <div className='flex gap-4 justify-between py-4 px-4 sm:px-8 md:px-20 bg-secondary border-b border-quaternary'>
      <div className='flex gap-20 w-full justify-between'>
        <Logo />
        <ul className='gap-8 items-center hidden lg:flex mr-4'>
          <li>
            <Link className={`${pathname === '/' ? 'font-bold' : ''}`} href='/'>
              Início
            </Link>
          </li>
          {/* <li>
            <Link className={`${pathname === '/post' ? 'font-bold' : ''}`} href='/post'>
              Ver posts
            </Link>
          </li> */}
          <li>
            <Link className={`${pathname === '/post/new' ? 'font-bold' : ''}`} href='/post/new'>
              Criar post
            </Link>
          </li>
        </ul>
      </div>
      <div className='gap-4 items-center hidden lg:flex'>
        <Settings />
      </div>
      <div className='hidden lg:flex'>
        <UserProfile />
      </div>
      <div className='items-center flex lg:hidden'>
        <Drawer direction='left'>
          <DrawerTrigger asChild>
            <Menu />
          </DrawerTrigger>
          <DrawerContent style={{ width: '100vw' }}>
            <DrawerHeader className='flex flex-row gap-2 items-center justify-between border-b'>
              <DrawerTitle asChild>
                <Logo />
              </DrawerTitle>

              <DrawerClose asChild>
                <Button
                  variant='destructive'
                  size='icon'
                  className='rounded-full size-8 p-0 flex items-center justify-center'
                >
                  <X className='size-5' />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className='p-4 pb-0'>
              <ul className='flex flex-col gap-8 items-center mr-4'>
                <li>
                  <Link className={`${pathname === '/' ? 'font-bold' : ''} text-xl`} href='/'>
                    Início
                  </Link>
                </li>
                {/* <li>
                  <Link className={`${pathname === '/post' ? 'font-bold' : ''} text-xl`} href='/post'>
                    Ver posts
                  </Link>
                </li> */}
                <li>
                  <Link className={`${pathname === '/post/new' ? 'font-bold' : ''} text-xl`} href='/post/new'>
                    Criar post
                  </Link>
                </li>
              </ul>
            </div>
            <DrawerFooter>
              <div className='flex justify-between items-center'>
                <UserProfile showUsername showEmail />
                <Settings />
              </div>
              <Button variant='destructive' onClick={handleLogout} className='cursor-pointer'>
                Logout
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
