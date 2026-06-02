//app/pago/exitoso/page.tsx
import { Suspense } from 'react'
import PagoExitosoClient from './pagoExitosoClient'

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={null}>
      <PagoExitosoClient />
    </Suspense>
  )
}