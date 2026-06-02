'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PagoPendienteClient() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const mpPaymentId  = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    if (!mpPaymentId || !preferenceId) return
    fetch(`/api/payments/webhook?mp_payment_id=${mpPaymentId}&preference_id=${preferenceId}`)
      .catch(() => {})
  }, [searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-info)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⏳</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-info)' }}>Pago pendiente</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <Link href="/" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base text-white transition-colors" style={{ backgroundColor: 'var(--color-info)' }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}