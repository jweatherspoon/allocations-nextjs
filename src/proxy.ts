import { auth0 } from '@/app/lib/auth/auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith('/auth')) {
    return authRes;
  }

  const session = await auth0.getSession(); // <----  Do not pass the request and let the package handle getting the cookies

  if (!session) {
    // user is not authenticated, redirect to login page
    return NextResponse.redirect(
      new URL('/auth/login', request.nextUrl.origin)
    );
  }

  // the headers from the auth middleware should always be returned
  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
