import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL(
        token?.is_doctor ? '/doctor-dashboard' : '/dashboard',
        request.url
      ));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!isAuth && (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/doctor-dashboard')
  )) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Redirect doctors to doctor dashboard and patients to patient dashboard
  if (isAuth) {
    if (token?.is_doctor && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/doctor-dashboard', request.url));
    }
    if (!token?.is_doctor && request.nextUrl.pathname.startsWith('/doctor-dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 