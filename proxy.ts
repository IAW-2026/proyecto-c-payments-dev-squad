import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/payments(.*)',
  '/api/admin(.*)',
  '/api/disputes',
  '/pago/exitoso',
  '/pago/error',
  '/pago/pendiente',
])

const isTokenRoute = createRouteMatcher([
  '/:orderId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
  '/',
])

export default clerkMiddleware(async (auth, req) => {
  if (isTokenRoute(req) && req.nextUrl.searchParams.get('token')) {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}