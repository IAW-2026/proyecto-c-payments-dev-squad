//POST /disputes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { pago_id, user_id, motivo } = await req.json()

    if (!pago_id || !user_id || !motivo) {
      return NextResponse.json(
        { error: 'pago_id, user_id y motivo son requeridos' },
        { status: 400 }
      )
    }

    // 1. Verificar que el pago existe y pertenece al usuario
    const pago = await prisma.pago.findUnique({
      where: { id: pago_id }
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (pago.userId !== user_id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (pago.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: 'Solo se pueden disputar pagos aprobados' },
        { status: 400 }
      )
    }

    // 2. Por ahora logueamos la disputa (podés agregar modelo Disputa a Prisma después)
    console.log('Nueva disputa:', { pago_id, user_id, motivo })

    return NextResponse.json({
      message: 'Disputa creada correctamente',
      pago_id,
      motivo,
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /disputes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}