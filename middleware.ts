import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance';
  const isAppointmentsPage = request.nextUrl.pathname.startsWith('/appointments') || 
                            request.nextUrl.pathname.startsWith('/dashboard/appointments') ||
                            request.nextUrl.pathname.startsWith('/doctor-dashboard/appointments') ||
                            request.nextUrl.pathname.includes('/book-appointment');

  console.log('Middleware - Token:', token);
  console.log('Middleware - Is Admin Route:', isAdminRoute);
  console.log('Middleware - Is Auth:', isAuth);
  console.log('Middleware - Path:', request.nextUrl.pathname);

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Check system settings
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { data: settings } = await supabase
      .from('system_settings')
      .select('*');

    const settingsMap = settings?.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // Check maintenance mode
    const isInMaintenance = settingsMap?.maintenance?.enabled === true;
    const isAdmin = token?.is_admin === true;
    const isRegistrationEnabled = settingsMap?.registration?.enabled !== false;
    const isAppointmentsEnabled = settingsMap?.appointments?.enabled !== false;

    // Debug logging
    console.log('Settings check:', {
      maintenance: isInMaintenance,
      isAdmin,
      registration: isRegistrationEnabled,
      appointments: isAppointmentsEnabled,
      path: request.nextUrl.pathname
    });

    if (isInMaintenance) {
      console.log('Maintenance mode is enabled');
      console.log('Is admin:', isAdmin);
      console.log('Current path:', request.nextUrl.pathname);
      
      // Allow access to maintenance page
      if (isMaintenancePage) {
        return NextResponse.next();
      }

      // Allow admin access to admin routes
      if (isAdmin && isAdminRoute) {
        return NextResponse.next();
      }

      // Allow access to auth pages
      if (isAuthPage) {
        return NextResponse.next();
      }

      // Redirect all other requests to maintenance page
      console.log('Redirecting to maintenance page');
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // If not in maintenance mode but on maintenance page, redirect to home
    if (!isInMaintenance && isMaintenancePage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle disabled registration
    if (!isRegistrationEnabled) {
      // Block access to signup page
      if (request.nextUrl.pathname === '/auth/signup') {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Block API calls to registration endpoints
      if (request.nextUrl.pathname === '/api/auth/signup') {
        return NextResponse.json(
          { error: 'Registration is currently disabled' },
          { status: 403 }
        );
      }
    }

    // Handle disabled appointments
    if (!isAppointmentsEnabled && !isAdmin) {
      if (isAppointmentsPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Block API calls to appointment endpoints
      if (request.nextUrl.pathname.startsWith('/api/appointments')) {
        return NextResponse.json(
          { error: 'Appointments are currently disabled' },
          { status: 403 }
        );
      }
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

    // Protect admin routes
    if (isAdminRoute && (!isAuth || !token?.is_admin)) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Protect authenticated routes
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error checking settings:', error);
    // Continue without settings check in case of error
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 