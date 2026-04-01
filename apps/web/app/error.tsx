'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [errorCount, setErrorCount, removeErrorCount] = usePersistedState('session', 'errorCount', 0);
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    if (navEntries.length > 0 && navEntries[0].type === 'reload') setErrorCount(errorCount + 1);
    else removeErrorCount();
    return () => {
      removeErrorCount();
    };
  }, []);

  function reload() {
    setErrorCount(errorCount + 1);
    reset();
  }

  function callSupport() {
    window.alert(`Acionar número/chat do suporte informando: ${error}`);
  }

  return (
    <div>
      <Card size='default' className='flex h-[390px] w-full flex-col shadow-sm transition-shadow hover:shadow-md'>
        <CardContent className='flex flex-1 justify-center flex-col items-center'>
          <CircleX size='60' color='red' className='mb-4' />
          <CardTitle className='text-xl font-bold text-center'>
            Algo deu errado, notifique um administrador ou tente novamente
          </CardTitle>
        </CardContent>

        <CardFooter className='flex border-t-0 p-4'>
          <Button
            variant='custom'
            size='default'
            className={cn('mx-1', { 'flex-5': errorCount >= 3, 'w-full': errorCount < 3 })}
            onClick={reload}
          >
            Tentar novamente
          </Button>
          {errorCount >= 3 && (
            <Button variant='outline' size='default' className='flex-5 mx-1' onClick={callSupport}>
              Contatar suporte
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
