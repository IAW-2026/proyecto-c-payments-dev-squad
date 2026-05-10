//POST /payments
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/db'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function POST(req: NextRequest) {
  try {
    const { orden_id, user_id } = await req.json()

    if (!orden_id || !user_id) {
      return NextResponse.json(
        { error: 'orden_id y user_id son requeridos' },
        { status: 400 }
      )
    }

    //Obtener la orden desde Buyer App
    const orderRes = await fetch(
      `${process.env.BUYER_APP_URL}/orders/${orden_id}`
    )
    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }
    const order = await orderRes.json()

    //Crear preferencia en MercadoPago
    const preference = await new Preference(client).create({
      body: {
        external_reference: orden_id,
        items: order.items.map((item: any) => ({
          id: item.producto_id,
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precio_unitario,
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/pago/exitoso`,
          failure: `${process.env.NEXT_PUBLIC_URL}/pago/error`,
          pending: `${process.env.NEXT_PUBLIC_URL}/pago/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/payments/webhook`,
      },
    })

    //Guardar el pago en la DB con estado PENDIENTE
    const pago = await prisma.pago.create({
      data: {
        ordenId: orden_id,
        userId: user_id,
        monto: order.total,
        estado: 'PENDIENTE',
        preferenceId: preference.id,
      },
    })

    //Devolver el init_point para que Buyer App redirija
    return NextResponse.json({
      pago_id: pago.id,
      init_point: preference.init_point,
    })

  } catch (error) {
    console.error('Error en POST /payments:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}