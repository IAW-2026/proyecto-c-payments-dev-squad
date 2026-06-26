'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

export default function PagoErrorClient() {
  const searchParams = useSearchParams()
  const { resolved } = useTheme()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('order_id') || sessionStorage.getItem('payment-orderid')
    if (id) setOrderId(id)

    const mpPaymentId  = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    if (!mpPaymentId || !preferenceId) return
    fetch(`/api/payments/webhook?mp_payment_id=${mpPaymentId}&preference_id=${preferenceId}`)
      .catch(() => {})
  }, [searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-danger)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">❌</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-danger)' }}>El pago falló</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Hubo un problema al procesar tu pago. Podés intentarlo nuevamente.
        </p>
        <div className="flex flex-col gap-2 sm:gap-3">
          {orderId && (
            <button
              onClick={() => {
                const token = sessionStorage.getItem('payment-token')
                const params = new URLSearchParams({ orderId })
                if (token) params.set('token', token)
                params.set('theme', resolved)
                window.location.href = `/?${params}`
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors"
              style={{ backgroundColor: 'var(--color-info)', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Reintentar el pago
            </button>
          )}
          <Link href={`${process.env.NEXT_PUBLIC_BUYER_APP_URL!}?theme=${resolved}`} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}>
            Volver al inicio  
          </Link>
        </div>
      </div>
    </main>
  )
}