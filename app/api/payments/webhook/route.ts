// POST /api/payments/webhook  ← MP llama acá
//
// PARA PROBAR LOCALMENTE:
//   npx ngrok http 3000
//   MP NO TIENE ACCESO A LOCALHOST — guardá la URL de ngrok en .env como NEXT_PUBLIC_URL
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/db'
import { postSale } from '@/lib/services/sellerApp'
import { postShipment } from '@/lib/services/shippingApp'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

const estadoMap: Record<string, 'APROBADO' | 'RECHAZADO' | 'PENDIENTE'> = {
  approved: 'APROBADO',
  rejected: 'RECHAZADO',
  pending:  'PENDIENTE',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const mpPaymentId = body.data?.id
    if (!mpPaymentId) {
      return NextResponse.json({ error: 'Sin payment id' }, { status: 400 })
    }

    const mpPayment   = await new Payment(client).get({ id: mpPaymentId })
    const ordenId     = mpPayment.external_reference
    const nuevoEstado = estadoMap[mpPayment.status ?? ''] ?? 'PENDIENTE'

    if (!ordenId) {
      return NextResponse.json({ error: 'Sin external_reference' }, { status: 400 })
    }

    const pago = await prisma.pago.findFirst({
      where: { ordenId },
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    await prisma.pago.update({
      where: { id: pago.id },
      data:  { estado: nuevoEstado },
    })

    if (nuevoEstado === 'APROBADO') {
      const sale = await postSale({
        orderId:   ordenId,
        sellerId:  mpPayment.collector_id?.toString() ?? '',
        paymentId: pago.id,
        total:     mpPayment.transaction_amount ?? pago.monto,
        items:     [],
      })

      const shipment = await postShipment({
        orderId:  ordenId,
        buyerId:  pago.userId,
        sellerId: mpPayment.collector_id?.toString() ?? '',
        items:    [],
        address:  { street: '', city: '', zip: '' },
      })

      await prisma.transaccion.upsert({
        where:  { pagoId: pago.id },
        update: {
          saleId:     sale.id,
          shipmentId: shipment.id,
        },
        create: {
          pagoId:     pago.id,
          metodo:     mpPayment.payment_method_id ?? 'desconocido',
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