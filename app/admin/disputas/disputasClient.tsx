'use client'
import { useEffect, useState } from 'react'

interface Disputa {
  id:      string
  pagoId:  string
  userId:  string
  motivo:  string
  estado:  'ABIERTA' | 'RESUELTA' | 'PERDIDA'
  origen:  string
  fecha:   string
  monto:   number
  ordenId: string
}

const estadoStyle: Record<string, { bg: string; color: string; label: string }> = {
  ABIERTA:  { bg: 'var(--color-danger-light)',  color: 'var(--color-danger)',  label: 'Abierta'  },
  RESUELTA: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Resuelta' },
  PERDIDA:  { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', label: 'Perdida'  },
}

export default function DisputasClient() {
  const [data, setData]       = useState<Disputa[]>([])
  const [loading, setLoading] = useState(true)

  function cargar() {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d.disputas); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/disputes/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ estado }),
    })
    cargar()
  }

  const abiertas  = data.filter(d => d.estado === 'ABIERTA').length
  const resueltas = data.filter(d => d.estado === 'RESUELTA').length
  const perdidas  = data.filter(d => d.estado === 'PERDIDA').length

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`
        @media (min-width: 640px) {
          #disputas-wrapper {
            padding: 32px;
            gap: 24px;
          }
        }
      `}</style>
      <div id="disputas-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-foreground)', margin: 0 }}>
            Disputas
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Pagos en disputa que requieren revisión.
          </p>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: `${abiertas} abierta${abiertas !== 1 ? 's' : ''}`,   style: estadoStyle.ABIERTA  },
            { label: `${resueltas} resuelta${resueltas !== 1 ? 's' : ''}`, style: estadoStyle.RESUELTA },
            { label: `${perdidas} perdida${perdidas !== 1 ? 's' : ''}`,    style: estadoStyle.PERDIDA  },
          ].map(b => (
            <div key={b.label} style={{
              padding:         '6px 12px',
              borderRadius:    '8px',
              backgroundColor: b.style.bg,
              color:           b.style.color,
              fontSize:        '11px',
              fontWeight:      700,
            }}>
              {b.label}
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '24px' }}>Cargando...</p>
        ) : data.length === 0 ? (
          <div style={{
            padding:         '32px 24px',
            textAlign:       'center',
            borderRadius:    '10px',
            border:          '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color:           'var(--color-muted)',
            fontSize:        '12px',
          }}>
            No hay disputas registradas.
          </div>
        ) : (
          <div style={{ borderRadius: '10px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: '0.8fr 0.8fr 0.8fr 80px 0.8fr 80px',
              padding:             '10px 12px',
              fontSize:            '10px',
              fontWeight:          600,
              textTransform:       'uppercase',
              letterSpacing:       '0.07em',
              backgroundColor:     'var(--color-surface-alt)',
              color:               'var(--color-muted)',
              overflow:            'auto',
            }}>
              <span>ID</span>
              <span className="hidden sm:inline">Orden</span>
              <span className="hidden sm:inline">Usuario</span>
              <span style={{ textAlign: 'right' }}>Monto</span>
              <span className="hidden sm:inline">Motivo</span>
              <span style={{ textAlign: 'center' }}>Estado</span>
            </div>

            {data.map((d, i) => {
              const s = estadoStyle[d.estado]
              return (
                <div
                  key={d.id}
                  style={{
                    display:             'grid',
                    gridTemplateColumns: '0.8fr 0.8fr 0.8fr 80px 0.8fr 80px',
                    padding:             '10px 12px',
                    fontSize:            '12px',
                    alignItems:          'center',
                    borderTop:           '1px solid var(--color-border)',
                    backgroundColor:     i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                    color:               'var(--color-foreground)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)' }}>
                    {d.id.slice(0, 6)}…
                  </span>
                  <span className="hidden sm:block" style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)' }}>
                    {d.ordenId.slice(0, 8)}…
                  </span>
                  <span className="hidden sm:block" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    {d.userId.slice(0, 8)}…
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)', fontSize: '11px' }}>
                    $ {d.monto.toLocaleString('es-AR')}
                  </span>
                  <span className="hidden sm:block" style={{
                    fontSize:     '11px',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}>
                    {d.motivo}
                  </span>

                  {/* Selector de estado */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <select
                      value={d.estado}
                      onChange={e => cambiarEstado(d.id, e.target.value)}
                      style={{
                        padding:         '3px 6px',
                        borderRadius:    '6px',
                        border:          'none',
                        backgroundColor: s.bg,
                        color:           s.color,
                        fontWeight:      700,
                        fontSize:        '10px',
                        cursor:          'pointer',
                      }}
                    >
                      <option value="ABIERTA">Abierta</option>
                      <option value="RESUELTA">Resuelta</option>
                      <option value="PERDIDA">Perdida</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}