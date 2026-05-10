import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { pago_id } = await req.json()

    if (!pago_id) {
      return NextResponse.json(
        { error: 'pago_id es requerido' },
        { status: 400 }
      )
    }

    // 1. Buscar el pago
    const pago = await prisma.pago.findUnique({
      where: { id: pago_id },
      include: { transaccion: true }
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (pago.estado !== 'APROBADO') {
      return NextResponse.json(
        { error: 'El pago no está aprobado' },
        { status: 400 }
      )
    }

    if (!pago.transaccion) {
      return NextResponse.json(
        { error: 'No existe transacción asociada' },
        { status: 400 }
      )
    }

    // 2. Notificar a Seller App para acreditar
    const sellerRes = await fetch(
      `${process.env.SELLER_APP_URL}/sales/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orden_id: pago.ordenId,
          monto: pago.monto,
          pago_id: pago.id,
        })
      }
    )

    if (!sellerRes.ok) {
      return NextResponse.json(
        { error: 'Error al acreditar al vendedor' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      message: 'Pago acreditado correctamente',
      pago_id: pago.id,
      orden_id: pago.ordenId,
      monto: pago.monto,
    })

  } catch (error) {
    console.error('Error en POST /payments/confirm:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}