// app/api/payments/webhook/route.ts
// POST /api/payments/webhook  ← MP llama acá
//
// PARA PROBAR LOCALMENTE:
//   npx ngrok http 3000
//   MP NO TIENE ACCESO A LOCALHOST — guardá la URL de ngrok en .env como NEXT_PUBLIC_URL
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

async function getMPPayment(id: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`MP API error: ${res.status}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { searchParams } = new URL(req.url)

    // MP manda el ID en dos lugares distintos según el formato
    const mpPaymentId =
      body.data?.id ||         // formato nuevo: { type: "payment", data: { id } }
      searchParams.get('id')   // formato viejo: ?id=xxx&topic=payment

    const type = body.type || searchParams.get('topic')

    // Solo nos interesa el evento de pago, ignorar merchant_order y otros
    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    if (!mpPaymentId) {
      return NextResponse.json({ error: 'Sin payment id' }, { status: 400 })
    }

    // Fetch directo a la API de MP — el SDK omite preference_id en el parseo
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
      where: preferenceId
        ? { preferenceId }          // búsqueda exacta — no hay colisiones
        : { ordenId },              // fallback si no viene (no debería pasar)
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

    // Chargeback — MP manda status "charged_back" o "in_process"
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
      const order    = await getOrder(ordenId)
      const sellerId = mpPayment.collector_id?.toString() ?? 'seller-mock-001'

      const sale = await postSale({
        orderId:  ordenId,
        sellerId,
        total:    mpPayment.transaction_amount ?? pago.monto,
      })

      const shipment = await postShipment(order)

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
    }

    // Siempre 200 — si MP recibe 4xx/5xx reintenta durante horas
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ received: true })
  }
}