// GET /api/payments/confirm?payment_id=xxx&order_id=xxx&mp_payment_id=xxx
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { postSale } from '@/lib/services/sellerApp'
import { postShipment } from '@/lib/services/shippingApp'
import { postTransaction } from '@/lib/services/buyerApp'
import type { OrderPayload } from '@/app/api/payments/route'

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

function verificarApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey === null) return true // frontend no manda key
  return apiKey === process.env.INTERNAL_API_KEY
}

export async function GET(req: NextRequest) {
  if (!verificarApiKey(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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

    if (pago.estado !== 'APROBADO') {
      // If we have an MP payment id and access token, try to resolve MP status
      if (mpPaymentId && process.env.MP_ACCESS_TOKEN) {
        const mpPayment = await getMPPayment(mpPaymentId)

        if (mpPayment) {
          const nuevoEstado = estadoMap[mpPayment.status] ?? 'PENDIENTE'

          await prisma.pago.update({ where: { id: pago.id }, data: { estado: nuevoEstado } })

          if (nuevoEstado === 'APROBADO' && !pago.transaccion) {
            if (!pago.orderData) {
              console.error('[confirm] pago sin orderData:', pago.id)
              return NextResponse.json({ error: 'Pago sin orderData' }, { status: 500 })
            }

            const order    = pago.orderData as unknown as OrderPayload
            const ordenId  = order.orderId
            const sellerId = order.items[0]?.sellerId
              ?? mpPayment.collector_id?.toString()
              ?? 'seller-mock-001'

            const sale = await postSale({
              orderId:  ordenId,
              sellerId,
              total:    mpPayment.transaction_amount ?? pago.monto,
              items:    order.items.map(item => ({
                productId: item.productId,
                quantity:  item.quantity,
                price:     item.price,
                sellerId:  item.sellerId ?? sellerId,
              })),
            })

            const shipment = await postShipment({
              id:            order.orderId,
              userId:        order.userId,
              total:         order.total,
              discount:      order.discount,
              shipping:      order.shipping,
              status:        order.status ?? 'PENDING',
              address:       order.address,
              originAddress: order.originAddress,
              carrier:       order.carrier,
              items:         order.items,
            })

            await postTransaction({ orderId: ordenId, userId: pago.userId, pagoId: pago.id, estado: 'APROBADO' })

            await prisma.transaccion.create({
              data: {
                pagoId:     pago.id,
                metodo:     mpPayment.payment_method_id ?? 'mercadopago',
                saleId:     sale.id,
                shipmentId: shipment.id,
              },
            })
          }

          pago = await prisma.pago.findUnique({ where: { id: pago.id }, include: { transaccion: true } })
        }
      } else if (!process.env.MP_ACCESS_TOKEN || pago.preferenceId === 'mock-no-mp') {
        // No MercadoPago configured (or mock preference) — auto-approve and process
        const nuevoEstado = 'APROBADO'
        await prisma.pago.update({ where: { id: pago.id }, data: { estado: nuevoEstado } })

        if (!pago.orderData) {
          console.error('[confirm] pago sin orderData (mock flow):', pago.id)
          return NextResponse.json({ error: 'Pago sin orderData' }, { status: 500 })
        }

        const order = pago.orderData as unknown as OrderPayload
        const sellerId = order.items[0]?.sellerId ?? 'seller-mock-001'

        const sale = await postSale({
          orderId: order.orderId,
          sellerId,
          total:   pago.monto,
          items:   order.items.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price, sellerId: item.sellerId ?? sellerId })),
        })

        const shipment = await postShipment({
          id:            order.orderId,
          userId:        order.userId,
          total:         order.total,
          discount:      order.discount,
          shipping:      order.shipping,
          status:        order.status ?? 'PENDING',
          address:       order.address,
          originAddress: order.originAddress,
          carrier:       order.carrier,
          items:         order.items,
        })

        await postTransaction({ orderId: order.orderId, userId: pago.userId, pagoId: pago.id, estado: 'APROBADO' })

        await prisma.transaccion.upsert({
          where:  { pagoId: pago.id },
          update: { saleId: sale.id, shipmentId: shipment.id },
          create: {
            pagoId:     pago.id,
            metodo:     'mercadopago',
            saleId:     sale.id,
            shipmentId: shipment.id,
          },
        })

        pago = await prisma.pago.findUnique({ where: { id: pago.id }, include: { transaccion: true } })
      }
    }

    if (pago!.estado === 'RECHAZADO') {
      return NextResponse.json(
        { error: 'El pago fue rechazado', estado: 'RECHAZADO' },
        { status: 400 }
      )
    }

    if (pago!.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: `El pago está en estado ${pago!.estado.toLowerCase()}`, estado: pago!.estado },
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