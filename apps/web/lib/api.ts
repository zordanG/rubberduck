import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { clearSession } from '@/app/actions/auth';

export async function fetchServer(url: string, options: RequestInit = {}, currentPath: string = '/') {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    await clearSession();
    redirect(`/refresh-session?callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  return response;
}
