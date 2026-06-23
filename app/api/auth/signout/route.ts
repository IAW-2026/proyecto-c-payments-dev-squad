import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const token   = searchParams.get('token')

  const res = NextResponse.redirect(
    new URL(`/?orderId=${orderId}&token=${token}`, req.url)
  )

  // Borrar las cookies de Clerk
  res.cookies.delete('__session')
  res.cookies.delete('__client_uat')

  return res
}