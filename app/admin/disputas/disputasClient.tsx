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
    fetch(`/api/admin/stats?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { console.log('[disputas] datos recibidos:', d.disputas); setData(d.disputas); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  async function cambiarEstado(id: string, estado: string) {
    const res = await fetch(`/api/disputes/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ estado }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[disputas] error al cambiar estado:', res.status, err)
      return
    }
    setData(prev => prev.map(d => d.id === id ? { ...d, estado: estado as Disputa['estado'] } : d))
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
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>ID</th>
                    <th className="hidden sm:table-cell" style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>Orden</th>
                    <th className="hidden sm:table-cell" style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>Usuario</th>
                    <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>Monto</th>
                    <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>Motivo</th>
                    <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted)' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => {
                    const s = estadoStyle[d.estado]
                    return (
                      <tr key={d.id} style={{ backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{d.id.slice(0, 6)}…</td>
                        <td className="hidden sm:table-cell" style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{d.ordenId.slice(0, 8)}…</td>
                        <td className="hidden sm:table-cell" style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{d.userId.slice(0, 8)}…</td>
                        <td style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--color-danger)', textAlign: 'right', whiteSpace: 'nowrap' }}>$ {d.monto.toLocaleString('es-AR')}</td>
                        <td style={{ padding: '10px 12px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{d.motivo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <select
                            value={d.estado}
                            onChange={e => cambiarEstado(d.id, e.target.value)}
                            style={{
                              padding: '3px 6px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-foreground)',
                              fontWeight: 700,
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="ABIERTA">Abierta</option>
                            <option value="RESUELTA">Resuelta</option>
                            <option value="PERDIDA">Perdida</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}