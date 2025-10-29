import { auth0 } from '@/app/lib/auth/auth0';
import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request); // Returns a NextResponse object

  // Ensure your own middleware does not handle the `/auth` routes, auto-mounted and handled by the SDK
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return authRes;
  }

  // Allow access to public routes without requiring a session
  if (request.nextUrl.pathname === '/') {
    return authRes;
  }

  // Any route that gets to this point will be considered a protected route, and require the user to be logged-in to be able to access it
  const { origin } = new URL(request.url);
  const session = await auth0.getSession(request);

  // If the user does not have a session, redirect to login
  if (!session) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  // If a valid session exists, continue with the response from Auth0 middleware
  // You can also add custom logic here...
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
