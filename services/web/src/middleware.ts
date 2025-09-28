import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Redirect root to dashboard if authenticated
    if (pathname === '/' && request.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect to login if accessing protected routes without auth
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/tasks') ||
      pathname.startsWith('/focus') ||
      pathname.startsWith('/analytics') ||
      pathname.startsWith('/settings')
    ) {
      if (!request.nextauth.token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(url)
      }
    }

    // Redirect to dashboard if accessing auth routes while authenticated
    if (
      (pathname.startsWith('/login') || pathname.startsWith('/signup')) &&
      request.nextauth.token
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function above
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}