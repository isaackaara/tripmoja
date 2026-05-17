import { auth } from '@/auth'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  const publicPaths = ['/', '/login', '/register', '/trips', '/how-it-works', '/rate']
  const isPublicPath =
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.ico).*)'],
}
