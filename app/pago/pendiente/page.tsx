// Redirige a exitoso o error según el resultado del pago
import Link from 'next/link'

export default function PagoPendiente() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 rounded-xl border border-blue-500 max-w-md w-full bg-gray-900">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-blue-400 mb-2">Pago pendiente</h1>
        <p className="text-gray-300 mb-6">
          Tu pago está siendo procesado. Te avisaremos cuando se confirme.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}