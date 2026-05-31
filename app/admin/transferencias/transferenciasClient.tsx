'use client'
// app/admin/transferencias/TransferenciasClient.tsx
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Estado = 'APROBADO' | 'PENDIENTE' | 'RECHAZADO'
type Tab    = 'TODOS' | Estado

interface Transferencia {
  id:           string
  ordenId:      string
  userId:       string
  monto:        number
  estado:       Estado
  preferenceId: string | null
  createdAt:    string
  transaccion:  { metodo: string; saleId: string } | null
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'TODOS',     label: 'Todos',     icon: '📋' },
  { id: 'APROBADO',  label: 'Exitosas',  icon: '✅' },
  { id: 'PENDIENTE', label: 'Pendientes',icon: '⏳' },
  { id: 'RECHAZADO', label: 'Rechazadas',icon: '❌' },
]

const ESTADO_STYLE: Record<Estado, { bg: string; color: string; label: string }> = {
  APROBADO:  { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Exitosa'   },
  PENDIENTE: { bg: 'var(--color-muted-light)',   color: 'var(--color-muted)',   label: 'Pendiente' },
  RECHAZADO: { bg: 'var(--color-danger-light)',  color: 'var(--color-danger)',  label: 'Rechazada' },
}

export default function TransferenciasClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [data, setData]       = useState<Transferencia[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('TODOS')

  const pageParam = parseInt(searchParams.get('page') || '1', 10) || 1
  const perPageParam = parseInt(searchParams.get('perPage') || '10', 10) || 10
  const qParam = searchParams.get('q') || ''

  const [page, setPage] = useState<number>(pageParam)
  const [perPage] = useState<number>(perPageParam)
  const [q, setQ] = useState<string>(qParam)
  const [totalPages, setTotalPages] = useState<number>(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('perPage', String(perPage))
        if (q) params.set('q', q)
        if (tab !== 'TODOS') params.set('estado', tab)

        const res = await fetch(`/api/admin/transferencias?${params.toString()}`)
        const json = await res.json()
        setData(json.items || [])
        setTotalPages(json.totalPages || 1)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, perPage, q, tab])

  const filas = data
  const total = filas.reduce((s, t) => s + t.monto, 0)

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`
        @media (min-width: 640px) {
          #transferencias-wrapper {
            padding: 32px;
            gap: 24px;
          }
        }
      `}</style>
      <div id="transferencias-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-foreground)', margin: 0 }}>
            Transferencias
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Historial completo de pagos de la plataforma.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display:         'flex',
          gap:             '2px',
          padding:         '3px',
          borderRadius:    '10px',
          width:           'fit-content',
          overflow:        'auto',
          backgroundColor: 'var(--color-surface)',
          border:          '1px solid var(--color-border)',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id)
                // update URL
                const params = new URLSearchParams(searchParams.toString())
                if (t.id === 'TODOS') params.delete('estado')
                else params.set('estado', t.id)
                params.set('page', '1')
                router.push(`${location.pathname}?${params.toString()}`)
                setPage(1)
              }}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             '3px',
                padding:         '6px 12px',
                borderRadius:    '8px',
                border:          'none',
                fontSize:        '11px',
                fontWeight:      600,
                cursor:          'pointer',
                backgroundColor: tab === t.id ? 'var(--color-info)'       : 'transparent',
                color:           tab === t.id ? 'var(--color-on-primary)'  : 'var(--color-muted)',
                transition:      'all 0.15s ease',
                whiteSpace:      'nowrap',
              }}
            >
              <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
                <span style={{
                fontSize:        '10px',
                fontWeight:      700,
                padding:         '1px 4px',
                borderRadius:    '999px',
                backgroundColor: tab === t.id ? 'rgba(255,255,255,0.2)' : 'var(--color-muted-light)',
                color:           tab === t.id ? 'var(--color-on-primary)' : 'var(--color-muted)',
              }}>
                {t.id === 'TODOS' ? data.length : data.filter(x => x.estado === t.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            aria-label="Buscar"
            placeholder="Buscar por pago, orden o usuario"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          />
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              if (q) params.set('q', q)
              else params.delete('q')
              params.set('page', '1')
              router.push(`${location.pathname}?${params.toString()}`)
              setPage(1)
            }}
            className="px-3 py-1 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Buscar
          </button>
        </div>

        {/* Summary */}
        <div style={{
          display:         'flex',
          gap:             '16px',
          padding:         '12px 16px',
          borderRadius:    '10px',
          width:           'fit-content',
          backgroundColor: 'var(--color-surface)',
          border:          '1px solid var(--color-border)',
          fontSize:        '12px',
        }}>
          <div>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '11px' }}>Transacciones</p>
            <p style={{ color: 'var(--color-foreground)', fontWeight: 900, fontSize: '16px', margin: '2px 0 0' }}>
              {filas.length}
            </p>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
          <div>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '11px' }}>Monto total</p>
            <p style={{ color: 'var(--color-foreground)', fontWeight: 900, fontSize: '16px', margin: '2px 0 0' }}>
              $ {total.toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '24px' }}>Cargando...</p>
        ) : (
          <div style={{ borderRadius: '10px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display:         'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 100px 80px',
              padding:         '10px 12px',
              fontSize:        '10px',
              fontWeight:      600,
              textTransform:   'uppercase',
              letterSpacing:   '0.07em',
              backgroundColor: 'var(--color-surface-alt)',
              color:           'var(--color-muted)',
              overflow:        'auto',
            }}>
              <span>ID Pago</span>
              <span className="hidden sm:inline">Orden</span>
              <span>Fecha</span>
              <span style={{ textAlign: 'right' }}>Monto</span>
              <span style={{ textAlign: 'center' }}>Estado</span>
            </div>

            {filas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)', fontSize: '12px' }}>
                No hay transferencias en esta categoría.
              </div>
            ) : filas.map((t, i) => {
              const st = ESTADO_STYLE[t.estado]
              return (
                <div
                  key={t.id}
                  style={{
                    display:             'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 100px 80px',
                    padding:             '10px 12px',
                    fontSize:            '12px',
                    alignItems:          'center',
                    borderTop:           '1px solid var(--color-border)',
                    backgroundColor:     i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                    color:               'var(--color-foreground)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)' }}>
                    {t.id.slice(0, 6)}…
                  </span>
                  <span className="hidden sm:block" style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-muted)' }}>
                    {t.ordenId.slice(0, 8)}…
                  </span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '11px' }}>
                    {new Date(t.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 600, fontSize: '11px' }}>
                    $ {t.monto.toLocaleString('es-AR')}
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      padding:         '2px 8px',
                      borderRadius:    '999px',
                      fontSize:        '10px',
                      fontWeight:      600,
                      backgroundColor: st.bg,
                      color:           st.color,
                    }}>
                      {st.label}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination controls */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
              Página {page} de {totalPages}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  if (page <= 1) return
                  const next = page - 1
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(next))
                  router.push(`${location.pathname}?${params.toString()}`)
                  setPage(next)
                }}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: page <= 1 ? 'var(--color-border)' : 'var(--color-surface)', color: 'var(--color-foreground)' }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => {
                  if (page >= totalPages) return
                  const next = page + 1
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(next))
                  router.push(`${location.pathname}?${params.toString()}`)
                  setPage(next)
                }}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: page >= totalPages ? 'var(--color-border)' : 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}