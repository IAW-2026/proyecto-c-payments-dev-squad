import { Suspense } from 'react'
import PagoErrorClient from './pagoErrorClient'

export default function PagoErrorPage() {
  return (
    <Suspense fallback={null}>
      <PagoErrorClient />
    </Suspense>
  )
}