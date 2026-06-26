// app/api/admin/stats/route.ts
// GET /api/admin/stats
// Devuelve estadísticas de pagos para el dashboard de admin.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

function startOf(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d
}

// Permite el acceso de dos formas:
// 1) Sesión de Clerk con rol admin (uso normal desde el panel web)
// 2) Header x-api-key correcto (uso server-to-server: Analytics, Control Plane)
async function autorizado(req: NextRequest): Promise<boolean> {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) return true
  return await isAdmin()
}

export async function GET(req: NextRequest) {
  if (!(await autorizado(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    pagos7d,
    pagos30d,
    pagos365d,
    rechazadas7d,
    rechazadas30d,
    exitosas7d,
    disputas7d,
    todasTransferencias,
    todasDisputas,
  ] = await Promise.all([
    // Montos por día — últimos 7 días (aprobados)
    prisma.pago.findMany({
      where: { estado: 'APROBADO', createdAt: { gte: startOf(7) } },
      select: { monto: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Montos por día — últimos 30 días (aprobados)
    prisma.pago.findMany({
      where: { estado: 'APROBADO', createdAt: { gte: startOf(30) } },
      select: { monto: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Montos por mes — último año (aprobados)
    prisma.pago.findMany({
      where: { estado: 'APROBADO', createdAt: { gte: startOf(365) } },
      select: { monto: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Montos por día — últimos 7 días (rechazados)
    prisma.pago.findMany({
      where: { estado: 'RECHAZADO', createdAt: { gte: startOf(7) } },
      select: { monto: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Montos por día — últimos 30 días (rechazados)
    prisma.pago.findMany({
      where: { estado: 'RECHAZADO', createdAt: { gte: startOf(30) } },
      select: { monto: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Cantidad de exitosas últimos 7 días
    prisma.pago.count({
      where: { estado: 'APROBADO', createdAt: { gte: startOf(7) } },
    }),
    // Cantidad de disputas últimos 7 días
    prisma.disputa.count({
      where: { fecha: { gte: startOf(7) } },
    }),
    // Todas las transferencias (para el listado)
    prisma.pago.findMany({
      include: { transaccion: true },
      orderBy: { createdAt: 'desc' },
    }),
    // Todas las disputas (para el listado)
    prisma.disputa.findMany({
      include: { pago: true },
      orderBy: { fecha: 'desc' },
    }),
  ])

  // Agrupa por día: { fecha: 'dd/mm', monto: number }
  function agruparPorDia(pagos: { monto: number; createdAt: Date }[]) {
    const map = new Map<string, number>()
    for (const p of pagos) {
      const key = p.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      map.set(key, (map.get(key) ?? 0) + p.monto)
    }
    return Array.from(map, ([fecha, monto]) => ({ fecha, monto }))
  }

  // Agrupa por mes: { fecha: 'mmm yy', monto: number }
  function agruparPorMes(pagos: { monto: number; createdAt: Date }[]) {
    const map = new Map<string, number>()
    for (const p of pagos) {
      const key = p.createdAt.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
      map.set(key, (map.get(key) ?? 0) + p.monto)
    }
    return Array.from(map, ([fecha, monto]) => ({ fecha, monto }))
  }

  return NextResponse.json({
    charts: {
      ultimos7dias:  agruparPorDia(pagos7d),
      ultimos30dias: agruparPorDia(pagos30d),
      ultimoAnio:    agruparPorMes(pagos365d),
    },
    chartsRechazadas: {
      ultimos7dias:  agruparPorDia(rechazadas7d),
      ultimos30dias: agruparPorDia(rechazadas30d),
    },
    kpis: {
      exitosas7d,
      disputas7d,
      montoTotal7d:  pagos7d.reduce((s, p) => s + p.monto, 0),
      montoTotal30d: pagos30d.reduce((s, p) => s + p.monto, 0),
      rechazadas7d:      rechazadas7d.length,
      montoRechazado7d:  rechazadas7d.reduce((s, p) => s + p.monto, 0),
    },
    transferencias: todasTransferencias.map(p => ({
      id:           p.id,
      ordenId:      p.ordenId,
      userId:       p.userId,
      monto:        p.monto,
      estado:       p.estado,
      preferenceId: p.preferenceId,
      createdAt:    p.createdAt,
      transaccion:  p.transaccion,
    })),
    disputas: todasDisputas.map(d => ({
      id:      d.id,
      pagoId:  d.pagoId,
      userId:  d.userId,
      motivo:  d.motivo,
      estado:  d.estado,   
      origen:  d.origen,  
      fecha:   d.fecha,
      monto:   d.pago.monto,
      ordenId: d.pago.ordenId,
    })),
  })
}