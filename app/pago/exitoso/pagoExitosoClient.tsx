'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Estado = 'cargando' | 'aprobado' | 'pendiente' | 'error'

export default function PagoExitosoClient() {
  const searchParams             = useSearchParams()
  const [estado, setEstado]      = useState<Estado>('cargando')
  const [intentos, setIntentos]  = useState(0)
  const [pagoId, setPagoId]      = useState<string | null>(null)
  const [modalAbierto, setModal] = useState(false)
  const [motivo, setMotivo]      = useState('')
  const [enviando, setEnviando]  = useState(false)
  const [disputaOk, setDisputaOk] = useState(false)

  useEffect(() => {
    const preferenceId = searchParams.get('preference_id')
    const orderId      = searchParams.get('external_reference')

    if (!preferenceId && !orderId) { setEstado('error'); return }

    const params = new URLSearchParams()
    if (preferenceId) params.set('payment_id', preferenceId)
    if (orderId)      params.set('order_id', orderId)

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
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-gray-600 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">⏳</div>
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

        {disputaOk && (
          <p className="text-yellow-400 text-sm mb-4">
            ✓ Disputa iniciada. El equipo la revisará a la brevedad.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Volver al inicio
          </Link>

          {!disputaOk && pagoId && (
            <button
              onClick={() => setModal(true)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              ¿Tuviste un problema con tu compra? Iniciá una disputa
            </button>
          )}
        </div>
      </div>

      {/* Modal disputa */}
      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-2">Iniciar disputa</h2>
            <p className="text-gray-400 text-sm mb-4">
              Describí el problema con tu compra. El equipo lo revisará.
            </p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: No recibí el producto, el artículo llegó dañado..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-gray-400"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={abrirDisputa}
                disabled={!motivo.trim() || enviando}
                className="flex-1 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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