import { Suspense } from 'react'
import PagoPendienteClient from './pagoPendienteClient'

export default function PagoPendiente() {
  return (
    <Suspense fallback={null}>
      <PagoPendienteClient />
    </Suspense>
  )
}