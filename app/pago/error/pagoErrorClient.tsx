'use client'

import Link from 'next/link'

export default function PagoErrorClient() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-red-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">El pago falló</h1>
        <p className="text-gray-300 mb-6">
          Hubo un problema al procesar tu pago. Podés intentarlo nuevamente.
        </p>
        <Link href="/" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
