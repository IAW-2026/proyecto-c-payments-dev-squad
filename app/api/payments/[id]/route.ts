import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pago = await prisma.pago.findUnique({
      where: { id },
      include: { transaccion: true },
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: pago.id,
      orden_id: pago.ordenId,
      user_id: pago.userId,
      monto: pago.monto,
      estado: pago.estado,
      preference_id: pago.preferenceId,
      transaccion: pago.transaccion ?? null,
      createdAt: pago.createdAt,
    })

  } catch (error) {
    console.error('Error en GET /payments/:id:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}