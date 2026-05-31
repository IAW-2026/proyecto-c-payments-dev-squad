// GET /api/payments/confirm?payment_id=xxx&order_id=xxx&mp_payment_id=xxx
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { postSale } from '@/lib/services/sellerApp'
import { postShipment } from '@/lib/services/shippingApp'
import { getOrder } from '@/lib/services/buyerApp'

const estadoMap: Record<string, 'APROBADO' | 'RECHAZADO' | 'PENDIENTE'> = {
  approved:     'APROBADO',
  rejected:     'RECHAZADO',
  pending:      'PENDIENTE',
  in_process:   'PENDIENTE',
  charged_back: 'RECHAZADO',
}

async function getMPPayment(mpPaymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${mpPaymentId}`,
    { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
  )
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentId   = searchParams.get('payment_id')
  const orderId     = searchParams.get('order_id')
  const mpPaymentId = searchParams.get('mp_payment_id')

  if (!paymentId && !orderId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  try {
    let pago = await prisma.pago.findFirst({
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

    // Fallback: si no está aprobado, consultamos directamente a MP con el ID real
    if (pago.estado !== 'APROBADO' && mpPaymentId && process.env.MP_ACCESS_TOKEN) {
      const mpPayment = await getMPPayment(mpPaymentId)

      if (mpPayment && estadoMap[mpPayment.status] === 'APROBADO') {
        await prisma.pago.update({
          where: { id: pago.id },
          data:  { estado: 'APROBADO' },
        })

        if (!pago.transaccion) {
          const ordenId  = mpPayment.external_reference ?? pago.ordenId
          const order    = await getOrder(ordenId)
          const sellerId = mpPayment.collector_id?.toString() ?? 'seller-mock-001'

          const sale     = await postSale({
            orderId:  ordenId,
            sellerId,
            total:    mpPayment.transaction_amount ?? pago.monto,
          })
          const shipment = await postShipment(order)

          await prisma.transaccion.create({
            data: {
              pagoId:     pago.id,
              metodo:     mpPayment.payment_method_id ?? 'mercadopago',
              saleId:     sale.id,
              shipmentId: shipment.id,
            },
          })
        }

        pago = await prisma.pago.findUnique({
          where:   { id: pago.id },
          include: { transaccion: true },
        })
      }
    }

    if (pago!.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: `El pago está en estado ${pago!.estado.toLowerCase()}` },
        { status: 402 }
      )
    }

    if (!pago!.transaccion) {
      return NextResponse.json(
        { error: 'Transacción aún no procesada' },
        { status: 402 }
      )
    }

    return NextResponse.json({
      pagoId:     pago!.id,
      orderId:    pago!.ordenId,
      saleId:     pago!.transaccion.saleId,
      shipmentId: pago!.transaccion.shipmentId,
      total:      pago!.monto,
    })

  } catch (error) {
    console.error('Error en GET /api/payments/confirm:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}