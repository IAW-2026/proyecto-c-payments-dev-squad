'use client'
// app/admin/disputas/DisputasClient.tsx
import { useEffect, useState } from 'react'

interface Disputa {
  id:      string
  pagoId:  string
  userId:  string
  motivo:  string
  fecha:   string
  monto:   number
  ordenId: string
}

export default function DisputasClient() {
  const [data, setData]       = useState<Disputa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d.disputas); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-foreground)', margin: 0 }}>
          Disputas
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px' }}>
          Pagos en disputa que requieren revisión.
        </p>
      </div>

      {/* Badge total */}
      <div style={{
        display:         'inline-flex',
        alignItems:      'center',
        gap:             '8px',
        padding:         '10px 16px',
        borderRadius:    '12px',
        width:           'fit-content',
        backgroundColor: data.length > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
        color:           data.length > 0 ? 'var(--color-danger)'       : 'var(--color-success)',
        fontSize:        '14px',
        fontWeight:      700,
      }}>
        {data.length > 0 ? '⚠️' : '✅'}
        {data.length > 0
          ? `${data.length} disputa${data.length > 1 ? 's' : ''} activa${data.length > 1 ? 's' : ''}`
          : 'Sin disputas activas'}
      </div>

      {/* Tabla */}
      {loading ? (
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '40px' }}>Cargando...</p>
      ) : data.length === 0 ? (
        <div style={{
          padding:         '60px',
          textAlign:       'center',
          borderRadius:    '16px',
          border:          '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color:           'var(--color-muted)',
          fontSize:        '14px',
        }}>
          No hay disputas registradas.
        </div>
      ) : (
        <div style={{ borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr 1fr 120px 1fr',
            padding:             '12px 20px',
            fontSize:            '11px',
            fontWeight:          600,
            textTransform:       'uppercase',
            letterSpacing:       '0.07em',
            backgroundColor:     'var(--color-surface-alt)',
            color:               'var(--color-muted)',
          }}>
            <span>ID Disputa</span>
            <span>Orden</span>
            <span>Usuario</span>
            <span style={{ textAlign: 'right' }}>Monto</span>
            <span>Motivo</span>
          </div>

          {data.map((d, i) => (
            <div
              key={d.id}
              style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr 1fr 120px 1fr',
                padding:             '14px 20px',
                fontSize:            '13px',
                alignItems:          'center',
                borderTop:           '1px solid var(--color-border)',
                backgroundColor:     i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                color:               'var(--color-foreground)',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-muted)' }}>
                {d.id.slice(0, 8)}…
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-muted)' }}>
                {d.ordenId.slice(0, 12)}…
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                {d.userId.slice(0, 12)}…
              </span>
              <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)' }}>
                $ {d.monto.toLocaleString('es-AR')}
              </span>
              <span style={{
                fontSize:     '12px',
                color:        'var(--color-foreground)',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}>
                {d.motivo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}