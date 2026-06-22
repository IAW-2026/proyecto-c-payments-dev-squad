import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { postSale } from '@/lib/services/sellerApp'
import { patchOrderStatus } from '@/lib/services/buyerApp'
import type { OrderPayload } from '@/app/api/payments/route'
import { splitDirecciones } from '@/lib/services/shippingCost'

const estadoMap: Record<string, 'APROBADO' | 'RECHAZADO' | 'PENDIENTE'> = {
  approved:     'APROBADO',
  rejected:     'RECHAZADO',
  pending:      'PENDIENTE',
  in_process:   'PENDIENTE',
  charged_back: 'RECHAZADO',
}

async function getMPPayment(id: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`MP API error: ${res.status}`)
  return res.json()
}

function verificarApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey === null) return true
  return apiKey === process.env.INTERNAL_API_KEY
}

async function enviarShipment(order: OrderPayload, originAddress: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_APP_URL}/api/shipments`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    process.env.SHIPPING_API_KEY ?? '',
    },
    body: JSON.stringify({
      orderId:      order.orderId,
      buyerId:      order.userId,
      address:      order.address,
      carrier:      order.carrier,
      shippingCost: order.shipping,
      items: order.items.map((item: any) => ({
        name:                 item.name,
        size:                 item.size,
        quantity:             item.quantity,
        price:                item.price,
        imageUrl:             item.imageUrl,
        color:                item.color,
        productOriginAddress: originAddress,
      })),
    }),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error('[enviarShipment] error body:', text)
    return { id: 'ship-fallback' }
  }
  try {
    return JSON.parse(text)
  } catch {
    return { id: 'ship-fallback' }
  }
}

export async function GET(req: NextRequest) {
  if (!verificarApiKey(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const mpPaymentId  = searchParams.get('mp_payment_id')
  const preferenceId = searchParams.get('preference_id')

  if (!mpPaymentId || !preferenceId || !process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const mpPayment   = await getMPPayment(mpPaymentId)
    const nuevoEstado = estadoMap[mpPayment.status] ?? 'PENDIENTE'

    const pago = await prisma.pago.findFirst({
      where:   { preferenceId },
      orderBy: { createdAt: 'desc' },
    })

    if (pago) {
      await prisma.pago.update({
        where: { id: pago.id },
        data:  { estado: nuevoEstado },
      })
    }

    return NextResponse.json({ ok: true, estado: nuevoEstado })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

export async function POST(req: NextRequest) {
  if (!verificarApiKey(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { searchParams } = new URL(req.url)

    const mpPaymentId = body.data?.id || searchParams.get('id')
    const type        = body.type || searchParams.get('topic')

    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    if (!mpPaymentId) {
      return NextResponse.json({ error: 'Sin payment id' }, { status: 400 })
    }

    const mpPayment    = await getMPPayment(mpPaymentId)
    const nuevoEstado  = estadoMap[mpPayment.status ?? ''] ?? 'PENDIENTE'
    const ordenId      = mpPayment.external_reference
    const preferenceId = mpPayment.preference_id as string | undefined

    console.log('[webhook] preferenceId:', preferenceId)
    console.log('[webhook] ordenId:', ordenId)
    console.log('[webhook] status MP:', mpPayment.status)

    if (!ordenId) {
      return NextResponse.json({ error: 'Sin external_reference' }, { status: 400 })
    }

    const pago = await prisma.pago.findFirst({
      where:   preferenceId ? { preferenceId } : { ordenId },
      orderBy: { createdAt: 'desc' },
    })

    console.log('[webhook] pago encontrado:', pago?.id, '| preferenceId en DB:', pago?.preferenceId)

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    await prisma.pago.update({
      where: { id: pago.id },
      data:  { estado: nuevoEstado },
    })

    if (mpPayment.status === 'charged_back' || mpPayment.status === 'in_process') {
      const disputaExistente = await prisma.disputa.findFirst({
        where: { pagoId: pago.id, origen: 'chargeback' },
      })

      if (!disputaExistente) {
        await prisma.disputa.create({
          data: {
            pagoId: pago.id,
            userId: pago.userId,
            motivo: mpPayment.status === 'charged_back'
              ? 'Contracargo iniciado por el comprador'
              : 'Pago en revisión por MercadoPago',
            origen: 'chargeback',
          },
        })
      }
    }

    if (nuevoEstado === 'APROBADO') {
      const transaccionExistente = await prisma.transaccion.findUnique({
        where: { pagoId: pago.id },
      })

      if (!transaccionExistente) {
        if (!pago.orderData) {
          console.error('[webhook] pago sin orderData:', pago.id)
          return NextResponse.json({ received: true })
        }

        const order    = pago.orderData as unknown as OrderPayload
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

        const dirs          = splitDirecciones(order.originAddress)
        const originAddress = dirs[dirs.length - 1]

        console.log('[webhook] enviando shipment:', { orderId: order.orderId, buyerId: order.userId, originAddress })

        const shipment = await enviarShipment(order, originAddress)

        await patchOrderStatus(ordenId, 'PAID')

        await prisma.transaccion.upsert({
          where:  { pagoId: pago.id },
          update: { saleId: sale.id, shipmentId: shipment.id },
          create: {
            pagoId:     pago.id,
            metodo:     mpPayment.payment_method_id ?? 'mercadopago',
            saleId:     sale.id,
            shipmentId: shipment.id,
          },
        })
      } else {
        console.log('[webhook] transaccion ya existente, ignorando duplicado:', pago.id)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ received: true })
  }
}