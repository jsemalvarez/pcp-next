import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './data/auth/session'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Proteger todas las rutas dentro de /admin excepto el login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Si un usuario ya logueado intenta ir al login, enviarlo al dashboard
  if (path === '/admin/login') {
    const session = await getSession();
    if (session) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}
