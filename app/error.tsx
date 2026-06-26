'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center p-6 sm:p-8 rounded-lg sm:rounded-xl border max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚠️</div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
          Ocurrió un error
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Algo salió mal mientras cargábamos esta página. Podés reintentar o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 sm:px-6 py-2 rounded-lg font-medium text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-4 sm:px-6 py-2 rounded-lg font-medium text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--color-muted)' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
