// Buyer llega acá tras pago aprobado

import Link from 'next/link'

export default function PagoExitoso() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-green-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-400 mb-2">¡Pago aprobado!</h1>
        <p className="text-gray-300 mb-6">
          Tu compra fue procesada correctamente. En breve recibirás la confirmación.
        </p>
        <Link
          href="/"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}