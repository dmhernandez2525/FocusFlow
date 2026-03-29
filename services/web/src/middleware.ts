import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // In demo mode, allow access to all dashboard routes without auth
  if (DEMO_MODE) {
    if (
      (pathname.startsWith('/login') || pathname.startsWith('/signup')) &&
      isAuthenticated
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Redirect root to dashboard if authenticated
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect to login if accessing protected routes without auth
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/focus') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/blocker') ||
    pathname.startsWith('/settings')
  ) {
    if (!isAuthenticated) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(url)
    }
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (
    (pathname.startsWith('/login') || pathname.startsWith('/signup')) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
