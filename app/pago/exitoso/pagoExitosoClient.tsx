// app/pago/exitoso/pagoExitosoClient.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Estado = 'cargando' | 'aprobado' | 'pendiente' | 'error'

export default function PagoExitoso() {
  const searchParams = useSearchParams()
  const [estado, setEstado]   = useState<Estado>('cargando')
  const [intentos, setIntentos] = useState(0)

  useEffect(() => {
    // MP manda preference_id y external_reference en la URL de retorno
    const preferenceId = searchParams.get('preference_id')
    const orderId      = searchParams.get('external_reference')

    if (!preferenceId && !orderId) {
      setEstado('error')
      return
    }

    const params = new URLSearchParams()
    if (preferenceId) params.set('payment_id', preferenceId)
    if (orderId)      params.set('order_id', orderId)

    let timeout: ReturnType<typeof setTimeout>

    async function consultar(intento: number) {
      try {
        const res  = await fetch(`/api/payments/confirm?${params}`)
        const data = await res.json()

        if (res.ok) {
          setEstado('aprobado')
          return
        }

        // Si está pendiente y no pasaron 10 intentos, reintentamos cada 2s
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

  if (estado === 'cargando') return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-gray-600 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4 animate-spin">⏳</div>
        <h1 className="text-xl font-bold text-gray-300 mb-2">Confirmando tu pago...</h1>
        <p className="text-gray-500 text-sm">Intento {intentos + 1} de 10</p>
      </div>
    </main>
  )

  if (estado === 'aprobado') return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-green-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-400 mb-2">¡Pago aprobado!</h1>
        <p className="text-gray-300 mb-6">
          Tu compra fue procesada correctamente. En breve recibirás la confirmación.
        </p>
        <Link href="/" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )

  if (estado === 'pendiente') return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-yellow-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">Pago en proceso</h1>
        <p className="text-gray-300 mb-6">
          Recibimos tu pago pero aún está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <Link href="/" className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-red-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">No pudimos confirmar tu pago</h1>
        <p className="text-gray-300 mb-6">
          Si realizaste el pago, no te preocupes — lo procesaremos igual. Revisá tu email.
        </p>
        <Link href="/" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}