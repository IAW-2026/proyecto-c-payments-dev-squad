//GET /payments/{id}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: params.id },
      include: { transaccion: true },
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: pago.id,
      orden_id: pago.ordenId,
      user_id: pago.userId,
      monto: pago.monto,
      estado: pago.estado,        // PENDIENTE ó APROBADO ó RECHAZADO (revisar en /pago)
      preference_id: pago.preferenceId,
      transaccion: pago.transaccion ?? null,
      createdAt: pago.createdAt,
    })

  } catch (error) {
    console.error('Error en GET /payments/:id:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
//Una vez que el webhook actualice el estado, 
//transaccion va a tener los datos del método de pago
//y estado va a ser APROBADO o RECHAZADO.

/* ESTO ES LO QUE DEVUELVE LA API CUANDO SE CONSULTA UN PAGO POR ID
{
  "id": "uuid-del-pago",
  "orden_id": "uuid-de-la-orden",
  "user_id": "clerk-user-id",
  "monto": 120000,
  "estado": "PENDIENTE",
  "preference_id": "mp-preference-id",
  "transaccion": null,
  "createdAt": "2026-05-10T..."
}
*/