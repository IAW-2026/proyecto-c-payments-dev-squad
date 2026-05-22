// GET /api/payments/confirm?payment_id=xxx&order_id=xxx
// Llamado desde pago/exito/page.tsx para armar el resumen post-pago.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as sellerApp from '@/lib/services/sellerApp'
import { getShipment } from '@/lib/services/shippingApp'

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

    const sale     = await (sellerApp as any).getSale(pago.transaccion!.saleId)
    const shipment = await getShipment(pago.ordenId)

    return NextResponse.json({
      orderId:    pago.ordenId,
      saleId:     sale.id,
      shipmentId: shipment.id,
      total:      pago.monto,
      items:      sale.items,
      shipment: {
        status:            shipment.status,
        estimatedDelivery: shipment.estimatedDelivery,
        carrier:           shipment.carrier,
      },
    })

  } catch (error) {
    console.error('Error en GET /api/payments/confirm:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}