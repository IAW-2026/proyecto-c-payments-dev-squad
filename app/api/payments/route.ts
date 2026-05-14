// POST /api/payments
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/db'
import { getOrder } from '@/lib/services/buyerApp'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId } = await req.json()

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'orderId y userId son requeridos' },
        { status: 400 }
      )
    }

    const order = await getOrder(orderId)

    const preference = await new Preference(client).create({
      body: {
        external_reference: orderId,
        items: order.items.map((item: any) => ({
          id:          item.productId,
          title:       item.name,
          quantity:    item.quantity,
          unit_price:  item.price,
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/pago/exito`,
          failure: `${process.env.NEXT_PUBLIC_URL}/pago/error`,
          pending: `${process.env.NEXT_PUBLIC_URL}/pago/pendiente`,
        },
        auto_return:      'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/payments/webhook`,
      },
    })

    const pago = await prisma.pago.create({
      data: {
        ordenId:      orderId,
        userId:       userId,
        monto:        order.total,
        estado:       'PENDIENTE',
        preferenceId: preference.id,
      },
    })

    return NextResponse.json({
      pagoId:     pago.id,
      init_point: preference.init_point,
    })

  } catch (error) {
    console.error('Error en POST /api/payments:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}