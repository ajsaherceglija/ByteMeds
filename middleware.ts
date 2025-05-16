import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });

  try {
    // Await the session check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Get the user data from session if it exists
    const user = session?.user ?? null;

    // Check if it's an admin route
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    
    // Check if it's a doctor route
    const isDoctorRoute = request.nextUrl.pathname.startsWith('/doctor-dashboard');

    // Check if it's an authenticated route
    const isAuthRoute = !request.nextUrl.pathname.startsWith('/api/auth') &&
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/static') &&
      !request.nextUrl.pathname.startsWith('/favicon') &&
      !request.nextUrl.pathname.startsWith('/avatars');

    // For debugging
    console.log('Middleware - User:', user);
    console.log('Middleware - Is Admin Route:', isAdminRoute);
    console.log('Middleware - Is Doctor Route:', isDoctorRoute);
    console.log('Middleware - Is Auth:', !!session);
    console.log('Middleware - Path:', request.nextUrl.pathname);

    // Get user metadata
    const metadata = user?.user_metadata ?? {};
    const isAdmin = metadata.is_admin === true;
    const isDoctor = metadata.is_doctor === true;

    // Check maintenance mode and other settings
    const settings = {
      maintenance: false, // You can make this dynamic by fetching from your database
      isAdmin,
      isDoctor,
      registration: true,
      appointments: true,
      path: request.nextUrl.pathname,
    };

    console.log('Settings check:', settings);

    // Handle maintenance mode
    if (settings.maintenance && !settings.isAdmin && !request.nextUrl.pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // Handle admin routes
    if (isAdminRoute && !settings.isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Handle doctor routes
    if (isDoctorRoute && !settings.isDoctor) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Handle authentication
    if (isAuthRoute && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 