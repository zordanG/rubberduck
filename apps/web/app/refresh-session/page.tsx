'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSession } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_AUTH_URL;

function LoadingState() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center space-y-4 bg-background'>
      <Loader2 className='h-12 w-12 animate-spin text-foreground' />
      <p className='text-lg font-medium text-muted-foreground'>Carregando...</p>
    </div>
  );
}

function RefreshManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let callbackUrl = searchParams.get('callbackUrl') || '/';

  if (!callbackUrl.startsWith('/')) {
    callbackUrl = '/';
  }

  useEffect(() => {
    let isMounted = true;

    async function attemptRefresh() {
      try {
        const response = await fetch(`${API_URL}/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to refresh session');
        }

        const data = await response.json();

        if (isMounted) {
          await createSession(data.accessToken, data.expiresIn);
          router.replace(callbackUrl);
        }
      } catch (error) {
        if (isMounted) {
          router.replace('/login');
        }
      }
    }

    attemptRefresh();

    return () => {
      isMounted = false;
    };
  }, [router, callbackUrl]);

  return <LoadingState />;
}

export default function RefreshSessionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RefreshManager />
    </Suspense>
  );
}
