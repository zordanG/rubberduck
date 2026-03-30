'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Settings() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SettingsIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='start'>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <div className='flex items-center gap-0 justify-center'>
              <Button
                variant='outline'
                size='icon'
                className='rounded-full size-8 flex p-0 m-0 items-center justify-center'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Moon className='size-5' /> : <Sun className='size-5' />}
              </Button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
