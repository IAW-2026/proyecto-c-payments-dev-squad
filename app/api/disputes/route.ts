// app/api/disputes/route.ts
// POST /api/disputes — el comprador abre una disputa
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { pagoId, motivo } = await req.json()

    if (!pagoId || !motivo) {
      return NextResponse.json(
        { error: 'pagoId y motivo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el pago existe y le pertenece al usuario
    const pago = await prisma.pago.findUnique({ where: { id: pagoId } })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (pago.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (pago.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: 'Solo se pueden disputar pagos aprobados' },
        { status: 400 }
      )
    }

    // Verificar que no haya una disputa abierta para este pago
    const disputaExistente = await prisma.disputa.findFirst({
      where: { pagoId, estado: 'ABIERTA' },
    })

    if (disputaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una disputa abierta para este pago' },
        { status: 409 }
      )
    }

    const disputa = await prisma.disputa.create({
      data: {
        pagoId,
        userId,
        motivo,
        origen: 'usuario',
      },
    })

    return NextResponse.json(disputa, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/disputes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}