'use client'
// app/admin/dashboard/DashboardClient.tsx
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

type Period = '7d' | '30d' | '1y'

interface ChartPoint { fecha: string; monto: number }

interface Stats {
  charts: {
    ultimos7dias:  ChartPoint[]
    ultimos30dias: ChartPoint[]
    ultimoAnio:    ChartPoint[]
  }
  kpis: {
    exitosas7d:    number
    disputas7d:    number
    montoTotal7d:  number
    montoTotal30d: number
  }
}

const PERIOD_LABELS: Record<Period, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '1y': 'Último año',
}

export default function DashboardClient() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [period, setPeriod]   = useState<Period>('7d')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => { setError('Error al cargar estadísticas'); setLoading(false) })
  }, [])

  const chartData = stats
    ? period === '7d'  ? stats.charts.ultimos7dias
    : period === '30d' ? stats.charts.ultimos30dias
    :                    stats.charts.ultimoAnio
    : []

  if (loading) return (
    <div style={{ padding: '40px', color: 'var(--color-muted)', textAlign: 'center' }}>
      Cargando estadísticas...
    </div>
  )

  if (error) return (
    <div style={{ padding: '40px', color: 'var(--color-danger)', textAlign: 'center' }}>
      {error}
    </div>
  )

  const kpis = [
    {
      label:     'Monto últimos 7 días',
      value:     `$ ${stats!.kpis.montoTotal7d.toLocaleString('es-AR')}`,
      icon:      '💰',
      highlight: false,
    },
    {
      label:     'Monto últimos 30 días',
      value:     `$ ${stats!.kpis.montoTotal30d.toLocaleString('es-AR')}`,
      icon:      '📅',
      highlight: false,
    },
    {
      label:     'Transferencias exitosas (7d)',
      value:     stats!.kpis.exitosas7d.toString(),
      icon:      '✅',
      highlight: true,
    },
    {
      label:     'Disputas (7d)',
      value:     stats!.kpis.disputas7d.toString(),
      icon:      '⚠️',
      highlight: false,
      danger:    stats!.kpis.disputas7d > 0,
    },
  ]

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`
        @media (min-width: 640px) {
          #dashboard-wrapper {
            padding: 32px;
            gap: 24px;
          }
        }
      `}</style>
      <div id="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-foreground)', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Resumen de actividad de la plataforma.
          </p>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              style={{
                backgroundColor: 'var(--color-surface)',
                border:          '1px solid var(--color-border)',
                borderRadius:    '12px',
                padding:         '12px 16px',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{kpi.icon}</div>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kpi.label}</p>
              <p style={{
                fontSize:   '16px',
                fontWeight: 900,
                margin:     '4px 0 0',
                color: (kpi as any).danger
                  ? 'var(--color-danger)'
                  : kpi.highlight
                    ? 'var(--color-success)'
                    : 'var(--color-foreground)',
              }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border:          '1px solid var(--color-border)',
            borderRadius:    '12px',
            padding:         '16px 12px',
          }}
        >
          {/* Period selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-foreground)', margin: 0 }}>
              Monto procesado
            </p>
            <div
              style={{
                display:         'flex',
                gap:             '2px',
                padding:         '3px',
                borderRadius:    '8px',
                backgroundColor: 'var(--color-surface-alt)',
                border:          '1px solid var(--color-border)',
              }}
            >
              {(['7d', '30d', '1y'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding:         '4px 10px',
                    borderRadius:    '6px',
                    border:          'none',
                    fontSize:        '11px',
                    fontWeight:      600,
                    cursor:          'pointer',
                    backgroundColor: period === p ? 'var(--color-info)'      : 'transparent',
                    color:           period === p ? 'var(--color-on-primary)' : 'var(--color-muted)',
                    transition:      'all 0.15s ease',
                  }}
                >
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : '1A'}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-muted)', fontSize: '13px' }}>
              Sin datos para este período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-info)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(v: number) => [`$ ${v.toLocaleString('es-AR')}`, 'Monto']}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border:          '1px solid var(--color-border)',
                    borderRadius:    '8px',
                    fontSize:        '12px',
                    color:           'var(--color-foreground)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="var(--color-info)"
                  strokeWidth={2}
                  fill="url(#gradMonto)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}