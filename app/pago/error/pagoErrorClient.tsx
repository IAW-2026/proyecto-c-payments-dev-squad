'use client'

import Link from 'next/link'

export default function PagoErrorClient() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-danger)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">❌</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-danger)' }}>El pago falló</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: 'var(--color-foreground)' }}>
          Hubo un problema al procesar tu pago. Podés intentarlo nuevamente.
        </p>
        <Link href="/" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base text-white transition-colors" style={{ backgroundColor: 'var(--color-danger)' }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
