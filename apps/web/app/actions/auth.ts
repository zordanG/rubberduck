'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_AUTH_URL;

export async function createSession(accessToken: string, expiresIn: number) {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Failed to synchronize logout with the API:', error);
    }
  }

  cookieStore.delete('accessToken');
}
