// app/api/disputes/[id]/route.ts
// PATCH /api/disputes/:id — el admin cambia el estado
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
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