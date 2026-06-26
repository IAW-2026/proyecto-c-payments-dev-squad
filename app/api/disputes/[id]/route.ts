// app/api/disputes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function autorizado(req: NextRequest): Promise<boolean> {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) return true
  return await isAdmin()
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await autorizado(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const { estado } = await req.json()

    if (!['ABIERTA', 'RESUELTA', 'PERDIDA'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const disputa = await prisma.disputa.update({
      where: { id },
      data:  { estado },
    })

    return NextResponse.json(disputa)

  } catch (error) {
    console.error('Error en PATCH /api/disputes/:id:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}