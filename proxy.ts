import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/payments/webhook',
  '/api/disputes',
  '/pago/exitoso',
  '/pago/error',
  '/pago/pendiente',
])

const isOrderRoute = createRouteMatcher([
  '/:orderId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
])

export default clerkMiddleware(async (auth, req) => {
  if (isOrderRoute(req) && req.nextUrl.searchParams.get('token')) {
    return NextResponse.next()
  }

  if (req.nextUrl.pathname === '/api/payments/webhook') {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}