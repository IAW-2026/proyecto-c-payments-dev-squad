'use client'
// app/admin/transferencias/TransferenciasClient.tsx
// Tabla de transferencias con tabs: Exitosas | Pendientes | Disputas.
// Datos mockeados — reemplazar fetch('/api/admin/transferencias') cuando esté listo el backend.

import { useState } from 'react'

type Estado = 'APROBADO' | 'PENDIENTE' | 'RECHAZADO'

interface Transferencia {
  id:        string
  ordenId:   string
  userId:    string
  monto:     number
  estado:    Estado
  metodo:    string
  fecha:     string
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TRANSFERENCIAS: Transferencia[] = [
  { id: 'pago-001', ordenId: 'order-001', userId: 'user-001', monto: 17099, estado: 'APROBADO',  metodo: 'mercadopago', fecha: '2026-05-14T10:22:00Z' },
  { id: 'pago-002', ordenId: 'order-002', userId: 'user-002', monto: 32500, estado: 'APROBADO',  metodo: 'mercadopago', fecha: '2026-05-14T11:05:00Z' },
  { id: 'pago-003', ordenId: 'order-003', userId: 'user-003', monto: 9800,  estado: 'PENDIENTE', metodo: 'mercadopago', fecha: '2026-05-15T08:40:00Z' },
  { id: 'pago-004', ordenId: 'order-004', userId: 'user-004', monto: 54200, estado: 'PENDIENTE', metodo: 'mercadopago', fecha: '2026-05-15T09:15:00Z' },
  { id: 'pago-005', ordenId: 'order-005', userId: 'user-005', monto: 21000, estado: 'RECHAZADO', metodo: 'mercadopago', fecha: '2026-05-13T17:30:00Z' },
  { id: 'pago-006', ordenId: 'order-006', userId: 'user-001', monto: 15600, estado: 'APROBADO',  metodo: 'mercadopago', fecha: '2026-05-16T07:00:00Z' },
  { id: 'pago-007', ordenId: 'order-007', userId: 'user-006', monto: 8900,  estado: 'RECHAZADO', metodo: 'mercadopago', fecha: '2026-05-12T14:20:00Z' },
]

// ── Tabs config ──────────────────────────────────────────────────────────────
type Tab = 'exitosas' | 'pendientes' | 'disputas'

const TABS: { id: Tab; label: string; icon: string; estado: Estado | null }[] = [
  { id: 'exitosas',   label: 'Exitosas',   icon: '✅', estado: 'APROBADO'  },
  { id: 'pendientes', label: 'Pendientes', icon: '⏳', estado: 'PENDIENTE' },
  { id: 'disputas',   label: 'Disputas',   icon: '⚠️', estado: 'RECHAZADO' },
]

const ESTADO_STYLE: Record<Estado, { bg: string; color: string; label: string }> = {
  APROBADO:  { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Aprobado'  },
  PENDIENTE: { bg: 'var(--color-muted-light)',   color: 'var(--color-muted)',   label: 'Pendiente' },
  RECHAZADO: { bg: 'var(--color-danger-light)',  color: 'var(--color-danger)',  label: 'Disputa'   },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TransferenciasClient() {
  const [tab, setTab] = useState<Tab>('exitosas')

  const estadoActivo = TABS.find(t => t.id === tab)?.estado
  const filas = MOCK_TRANSFERENCIAS.filter(t => t.estado === estadoActivo)

  const totalMonto = filas.reduce((acc, t) => acc + t.monto, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-foreground)' }}>
          Transferencias
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Revisá el estado de todos los pagos de la plataforma.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 p-1 rounded-2xl w-fit border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {TABS.map((t) => {
          const count   = MOCK_TRANSFERENCIAS.filter(x => x.estado === t.estado).length
          const active  = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                backgroundColor: active ? 'var(--color-info)'       : 'transparent',
                color:           active ? 'var(--color-on-primary)'  : 'var(--color-muted)',
              }}
            >
              <span>{t.icon}</span>
              {t.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs font-black"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--color-muted-light)',
                  color:           active ? '#fff'                   : 'var(--color-muted)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary pill */}
      <div
        className="rounded-2xl px-5 py-3 border flex items-center justify-between w-fit gap-8"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Transacciones</p>
          <p className="text-xl font-black" style={{ color: 'var(--color-foreground)' }}>{filas.length}</p>
        </div>
        <div
          className="w-px h-8 self-center"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Monto total</p>
          <p className="text-xl font-black" style={{ color: 'var(--color-foreground)' }}>
            $ {totalMonto.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_1fr_1fr_120px_100px] px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-muted)' }}
        >
          <span>ID Pago</span>
          <span>Orden</span>
          <span>Fecha</span>
          <span className="text-right">Monto</span>
          <span className="text-center">Estado</span>
        </div>

        {/* Rows */}
        {filas.length === 0 ? (
          <div
            className="px-5 py-10 text-center text-sm"
            style={{ color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
          >
            No hay transferencias en esta categoría.
          </div>
        ) : (
          filas.map((t, i) => {
            const st = ESTADO_STYLE[t.estado]
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_1fr_1fr_120px_100px] px-5 py-4 text-sm items-center border-t"
                style={{
                  backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                  borderColor:     'var(--color-border)',
                  color:           'var(--color-foreground)',
                }}
              >
                <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                  {t.id}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                  {t.ordenId}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  {formatFecha(t.fecha)}
                </span>
                <span className="text-right font-semibold">
                  $ {t.monto.toLocaleString('es-AR')}
                </span>
                <span className="flex justify-center">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </span>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}