// GET /api/payments/confirm?payment_id=xxx&order_id=xxx
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('payment_id')
  const orderId   = searchParams.get('order_id')

  if (!paymentId && !orderId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  try {
    const pago = await prisma.pago.findFirst({
      where: {
        OR: [
          ...(paymentId ? [{ preferenceId: paymentId }] : []),
          ...(orderId   ? [{ ordenId: orderId }]        : []),
        ],
      },
      include: { transaccion: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (pago.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: `El pago está en estado ${pago.estado.toLowerCase()}` },
        { status: 402 }
      )
    }

    if (!pago.transaccion) {
      return NextResponse.json(
        { error: 'Transacción aún no procesada' },
        { status: 402 }
      )
    }

    return NextResponse.json({
      pagoId:     pago.id,
      orderId:    pago.ordenId,
      saleId:     pago.transaccion.saleId,
      shipmentId: pago.transaccion.shipmentId,
      total:      pago.monto,
    })

  } catch (error) {
    console.error('Error en GET /api/payments/confirm:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}