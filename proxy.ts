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

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === '/api/payments/webhook') {
    return NextResponse.next()
  }
  // Cualquier ruta bajo /api/admin/* pasa directo — se protege con x-api-key propia
  if (req.nextUrl.pathname.startsWith('/api/admin/')) {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}