'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

type Estado = 'cargando' | 'aprobado' | 'pendiente' | 'error'

export default function PagoExitosoClient() {
  const searchParams             = useSearchParams()
  const { resolved }             = useTheme()
  const [estado, setEstado]      = useState<Estado>('cargando')
  const [intentos, setIntentos]  = useState(0)
  const [pagoId, setPagoId]      = useState<string | null>(null)
  const [orderId, setOrderId]    = useState<string | null>(null)
  const [modalAbierto, setModal] = useState(false)
  const [motivo, setMotivo]      = useState('')
  const [enviando, setEnviando]  = useState(false)
  const [disputaOk, setDisputaOk] = useState(false)

  useEffect(() => {
  const preferenceId  = searchParams.get('preference_id')
  const orderId       = searchParams.get('external_reference') ?? searchParams.get('order_id')
  const mpPaymentId   = searchParams.get('payment_id')

  if (!preferenceId && !orderId) { setEstado('error'); return }

  setOrderId(orderId)
  const params = new URLSearchParams()
  if (preferenceId) params.set('payment_id', preferenceId)
  if (orderId)      params.set('order_id', orderId)
  if (mpPaymentId)  params.set('mp_payment_id', mpPaymentId)

  let timeout: ReturnType<typeof setTimeout>

  async function consultar(intento: number) {
    try {
      const res  = await fetch(`/api/payments/confirm?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPagoId(data.pagoId ?? null)
        setEstado('aprobado')
        return
      }

      if (res.status === 400) {
        window.location.href = `/pago/error?order_id=${orderId ?? ''}`
        return
      }

      if (res.status === 402 && intento < 10) {
        setIntentos(intento + 1)
        timeout = setTimeout(() => consultar(intento + 1), 2000)
      } else {
        setEstado('pendiente')
      }
    } catch {
      setEstado('error')
    }
  }

  consultar(0)
  return () => clearTimeout(timeout)
}, [searchParams])

  async function abrirDisputa() {
    if (!motivo.trim() || !pagoId) return
    setEnviando(true)
    try {
      const res = await fetch('/api/disputes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pagoId, motivo }),
      })
      if (res.ok) {
        setDisputaOk(true)
        setModal(false)
        setMotivo('')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (estado === 'cargando') return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⏳</div>
        <h1 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-foreground)' }}>Confirmando tu pago...</h1>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-muted)' }}>Intento {intentos + 1} de 10</p>
      </div>
    </main>
  )

  if (estado === 'aprobado') return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-success)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">✅</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-success)' }}>¡Pago aprobado!</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Tu compra fue procesada correctamente. En breve recibirás la confirmación.
        </p>

        {disputaOk && (
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            ✓ Disputa iniciada. El equipo la revisará a la brevedad.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:gap-3">
        <a href={`https://zapasya.vercel.app/order-confirmation/${orderId ?? ''}?theme=${resolved}`} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}>
          Ver orden de compra confirmada
        </a>
        <button
          onClick={async () => {
            if (!orderId) return
            try {
              const userId = sessionStorage.getItem('payment-userid') ?? undefined
              const { getTrackingUrl } = await import('@/lib/actions/tracking')
              const url = await getTrackingUrl(orderId, userId)
              window.location.href = url
            } catch {
              window.location.href = `${process.env.NEXT_PUBLIC_SHIPPING_APP_URL}/dashboard/shipments/${orderId}`
            }
          }}
          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors"
          style={{ backgroundColor: 'var(--color-info)', color: 'white' }}
        >
          Ver mi envío
        </button>

          {!disputaOk && pagoId && (
            <button
              onClick={() => setModal(true)}
              className="text-xs sm:text-sm transition-colors underline" style={{ color: 'var(--color-muted)' }}
            >
              ¿Tuviste un problema con tu compra? Presenta una queja y lo resolveremos lo antes posible.
            </button>
          )}
        </div>
      </div>

      {/* Modal disputa */}
      {modalAbierto && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setModal(false)}
        >
          <div
            className="rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-sm w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-foreground)' }}>Iniciar disputa</h2>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--color-muted)' }}>
              Describí el problema con tu compra. El equipo lo revisará.
            </p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: No recibí el producto, el artículo llegó dañado..."
              rows={4}
              className="w-full rounded-lg p-2 sm:p-3 text-xs sm:text-sm resize-none focus:outline-none border" style={{ 
                backgroundColor: 'var(--color-surface-alt)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)'
              }}
            />
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors" style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={abrirDisputa}
                disabled={!motivo.trim() || enviando}
                className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{
                  backgroundColor: 'var(--color-info)'
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar disputa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )

  if (estado === 'pendiente') return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-info)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⏳</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-info)' }}>Pago en proceso</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Recibimos tu pago pero aún está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <Link href={`${process.env.NEXT_PUBLIC_BUYER_APP_URL!}?theme=${resolved}`} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}>
          Volver al inicio  
        </Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-danger)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">❌</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-danger)' }}>No pudimos confirmar tu pago</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Si realizaste el pago, no te preocupes — lo procesaremos igual. Revisá tu email.
        </p>
        <Link href={`${process.env.NEXT_PUBLIC_BUYER_APP_URL!}?theme=${resolved}`} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}>
          Volver al inicio  
        </Link>
      </div>
    </main>
  )
}