'use client';

import clsx from 'clsx';
import { SettingsIcon, User2Icon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <div className='flex gap-4 justify-between px-20 py-4 bg-secondary border-b border-quaternary'>
      <div className='flex gap-20'>
        <Link href='./' className='flex gap-2  items-center'>
          <div className='size-10 bg-tertiary rounded-full' />
          <div>
            <label className='block text-2xl font-bold leading-6'>Rubberduck</label>
            <label className='block text-xs text-right'>for Devs</label>
          </div>
        </Link>
        <ul className='flex gap-8 items-center'>
          <li>
            <Link className={`${pathname === '/' ? 'font-bold' : ''}`} href='./'>
              Início
            </Link>
          </li>
          <li>
            <Link className={`${pathname === '/new' ? 'font-bold' : ''}`} href='new'>
              Criar post
            </Link>
          </li>
        </ul>
      </div>
      <div className='flex gap-4 items-center'>
        <Link href='./settings' className='p-2 transition-colors rounded-full hover:bg-tertiary hover:text-secondary'>
          <SettingsIcon />
        </Link>
        <div className='flex items-center justify-center p-3 rounded-full bg-tertiary'>
          <User2Icon className='text-secondary' />
        </div>
      </div>
    </div>
  );
}
