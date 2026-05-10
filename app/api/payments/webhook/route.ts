//POST /payments/webhook (MP llama acá)
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/db'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    //Solo notificaciones de pagos
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Sin payment id' }, { status: 400 })
    }

    //Consultar el pago en MP para obtener los datos reales
    const mpPayment = await new Payment(client).get({ id: paymentId })

    const ordenId = mpPayment.external_reference
    const mpEstado = mpPayment.status // approved | rejected | pending

    if (!ordenId) {
      return NextResponse.json({ error: 'Sin external_reference' }, { status: 400 })
    }

    //Mapear estado de MP a nuestro enum
    const estadoMap: Record<string, 'APROBADO' | 'RECHAZADO' | 'PENDIENTE'> = {
      approved: 'APROBADO',
      rejected: 'RECHAZADO',
      pending: 'PENDIENTE',
    }
    const nuevoEstado = estadoMap[mpEstado ?? ''] ?? 'PENDIENTE'

    //Buscar el pago en nuestra DB por orden_id
    const pago = await prisma.pago.findFirst({
      where: { ordenId }
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    //Actualizar estado del pago y crear la transacción
    await prisma.pago.update({
      where: { id: pago.id },
      data: { estado: nuevoEstado }
    })

    if (nuevoEstado === 'APROBADO') {
      //Registrar la transacción
      await prisma.transaccion.upsert({
        where: { pagoId: pago.id },
        update: {},
        create: {
          pagoId: pago.id,
          metodo: mpPayment.payment_method_id ?? 'desconocido',
        }
      })

      //Notificar a Seller App → POST /sales
      await fetch(`${process.env.SELLER_APP_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ordenId,
          sellerId: mpPayment.collector_id?.toString(),
          total: mpPayment.transaction_amount,
          paymentId: pago.id,
        })
      })

      //Crear orden de envío → POST /shipments
      await fetch(`${process.env.SHIPPING_APP_URL}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: ordenId,
          buyer_id: pago.userId,
        })
      })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error en webhook:', error)
    // Siempre devolver 200 a MP, sino reintenta indefinidamente
    // Si MP recibe un error del tipo 500 o 400, reintenta la notificación varias veces durante horas/días
    return NextResponse.json({ received: true })
  }
}

//PARA PROBAR EL WEBHOOK LOCALMENTE USANDO NGROK:
//npx ngrok http 3000
//MP NO TIENE ACCESO A LOCALHOST !!!!! --Acordate ANGE
//Y ahí usás la URL que te da ngrok para configurar el notification_url 
//y la guardo en .env como NEXT_PUBLIC_URL.