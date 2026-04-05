import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/password/reset/request', '/refresh-session'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookiesList = await cookies();
  const token = cookiesList.get('accessToken')?.value;
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!token && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/refresh-session?callbackUrl=${callbackUrl}`, req.url));
  }

  if (token && isPublicRoute && pathname !== '/refresh-session') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|\\.well-known).*)'],
};
