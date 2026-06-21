// app/api/admin/transferencias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

async function autorizado(req: NextRequest): Promise<boolean> {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) return true
  return await isAdmin()
}

export async function GET(req: NextRequest) {
  try {
    if (!(await autorizado(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('perPage') || '10', 10)))
    const q = url.searchParams.get('q') || ''
    const estado = url.searchParams.get('estado') || ''

    const where: any = {}
    if (q) {
      const qLike = { contains: q }
      where.OR = [
        { id: qLike },
        { ordenId: qLike },
        { userId: qLike },
      ]
    }
    if (estado) where.estado = estado

    const total = await prisma.pago.count({ where })

    const items = await prisma.pago.findMany({
      where,
      include: { transaccion: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return NextResponse.json({
      items: items.map(p => ({
        id: p.id,
        ordenId: p.ordenId,
        userId: p.userId,
        monto: p.monto,
        estado: p.estado,
        preferenceId: p.preferenceId,
        createdAt: p.createdAt,
        transaccion: p.transaccion,
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1,
    })

  } catch (error) {
    console.error('Error en GET /api/admin/transferencias:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}