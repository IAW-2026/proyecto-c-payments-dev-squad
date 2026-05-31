// GET /api/payments/confirm?payment_id=xxx&order_id=xxx
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

async function getMPPaymentByPreference(preferenceId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?q=${preferenceId}&sort=date_created&criteria=desc&limit=1`,
    { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  // Filtrar para asegurarse que es el preference correcto
  return data.results?.find((p: any) => p.preference_id === preferenceId) ?? null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('payment_id')
  const orderId   = searchParams.get('order_id')

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

    // Fallback: si el pago no está aprobado, consultamos directamente a MP
    if (pago.estado !== 'APROBADO' && paymentId && process.env.MP_ACCESS_TOKEN) {
      const mpPayment = await getMPPaymentByPreference(paymentId)

      if (mpPayment) {
        const nuevoEstado = estadoMap[mpPayment.status ?? ''] ?? 'PENDIENTE'

        if (nuevoEstado === 'APROBADO') {
          // Actualizar estado en DB
          await prisma.pago.update({
            where: { id: pago.id },
            data:  { estado: 'APROBADO' },
          })

          // Crear transaccion si no existe
          if (!pago.transaccion) {
            const ordenId     = mpPayment.external_reference ?? pago.ordenId
            const order       = await getOrder(ordenId)
            const sellerId    = mpPayment.collector_id?.toString() ?? 'seller-mock-001'

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

          // Releer el pago actualizado
          pago = await prisma.pago.findUnique({
            where:   { id: pago.id },
            include: { transaccion: true },
          })!
        }
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