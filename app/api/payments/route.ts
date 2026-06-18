// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calcularTotalOrden } from '@/lib/services/buyerApp'
import { calcularCostoEnvio } from '@/lib/services/shippingCost'

export type OrderItem = {
  name: string
  price: number
  quantity: number
  size: number
  color: string | null
  imageUrl: string | null
  productId: string
  sellerId?: string
}

export type OrderPayload = {
  orderId: string
  userId: string
  total: number
  discount: number
  shipping: number
  status?: string
  address: string
  originAddress: string
  carrier: 'MAIL' | 'PICKUP'
  items: OrderItem[]
}

export async function POST(req: NextRequest) {
  try {
    const order: OrderPayload = await req.json()

    if (!order.orderId) {
      return NextResponse.json(
        { error: 'orderId es requerido' },
        { status: 400 }
      )
    }

    if (!order.userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    if (!order.items?.length) {
      return NextResponse.json(
        { error: 'La orden debe contener items' },
        { status: 400 }
      )
    }

    let shipping = order.shipping

    if (order.carrier === 'MAIL' && shipping === 0) {
      shipping = await calcularCostoEnvio(
        order.originAddress,
        order.address
      )
    }

    const total = calcularTotalOrden({
      id: order.orderId,
      userId: order.userId,
      total: order.total,
      discount: order.discount,
      shipping,
      status: order.status ?? 'PENDING',
      address: order.address,
      originAddress: order.originAddress,
      carrier: order.carrier,
      items: order.items,
    })

    // Orden "congelada" tal como va a usarse después en confirm/webhook,
    // con shipping y total ya resueltos (no se recalculan más adelante).
    const orderData: OrderPayload = {
      ...order,
      shipping,
      total,
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      const pago = await prisma.pago.create({
        data: {
          ordenId: order.orderId,
          userId: order.userId,
          monto: total,
          estado: 'PENDIENTE',
          preferenceId: 'mock-no-mp',
          orderData: orderData as any,
        },
      })

      return NextResponse.json({
        pagoId: pago.id,
        init_point: null,
      })
    }

    const rootUrl = process.env.NEXT_PUBLIC_URL
    if (!rootUrl) {
      console.error('NEXT_PUBLIC_URL no está configurada para MercadoPago')
      return NextResponse.json({ error: 'Configuración incompleta de pagos' }, { status: 500 })
    }

    const { MercadoPagoConfig, Preference } = await import('mercadopago')

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    })

    const preference = await new Preference(client).create({
      body: {
        external_reference: order.orderId,
        items: [
          {
            id: order.orderId,
            title:
              order.items.length === 1
                ? order.items[0].name
                : `Orden ${order.orderId.slice(0, 8)}`,
            quantity: 1,
            unit_price: total,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${rootUrl}/pago/exitoso`,
          failure: `${rootUrl}/pago/error`,
          pending: `${rootUrl}/pago/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${rootUrl}/api/payments/webhook`,
      },
    })

    const pago = await prisma.pago.create({
      data: {
        ordenId: order.orderId,
        userId: order.userId,
        monto: total,
        estado: 'PENDIENTE',
        preferenceId: preference.id!,
        orderData: orderData as any,
      },
    })

    return NextResponse.json({
      pagoId: pago.id,
      preferenceId: preference.id,
      init_point: preference.init_point,
    })

  } catch (error) {
    console.error('Error en POST /api/payments:', error)

    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}