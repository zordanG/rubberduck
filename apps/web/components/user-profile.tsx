'use client';

import { User2Icon } from 'lucide-react';

type UserProfileProps = {
  showEmail?: boolean;
  showUsername?: boolean;
};

export function UserProfile({ showEmail = false, showUsername = false }: UserProfileProps) {
  const showInfo = showEmail || showUsername;

  return (
    <div className='flex items-center gap-2'>
      <div className='flex items-center justify-center size-9 rounded-full bg-tertiary'>
        <User2Icon className='text-secondary size-6' />
      </div>
      {showInfo && (
        <div className='flex flex-col justify-center'>
          {showUsername && <span className='text-sm'>Username</span>}
          {showEmail && <span className='text-xs text-muted-foreground'>email@exemplo.com</span>}
        </div>
      )}
    </div>
  );
}
