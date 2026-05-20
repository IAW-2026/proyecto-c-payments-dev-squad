// app/api/payments/route.ts
// POST /api/payments — crea la preferencia de MP y devuelve init_point
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOrder } from '@/lib/services/buyerApp'

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

    // ── Guard: sin credenciales de MP, simulamos el flujo para dev ──────────
    if (!process.env.MP_ACCESS_TOKEN) {
      const pago = await prisma.pago.create({
        data: {
          ordenId:      orderId,
          userId:       userId,
          monto:        order.total,
          estado:       'PENDIENTE',
          preferenceId: 'mock-no-mp',
        },
      })
      return NextResponse.json({ pagoId: pago.id, init_point: null })
    }
    // ────────────────────────────────────────────────────────────────────────

    const { MercadoPagoConfig, Preference } = await import('mercadopago')

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    })

    const preference = await new Preference(client).create({
      body: {
        external_reference: orderId,
        items: order.items.map((item) => ({
          id:          item.name,
          title:       item.name,
          quantity:    item.quantity,
          unit_price:  item.price,
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/pago/exitoso`,
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
        preferenceId: preference.id!,
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