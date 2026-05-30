import { Suspense } from 'react'
import EnvioClient from './envioClient'

interface EnvioPageProps {
  searchParams?: {
    orderId?: string
  }
}

export default function EnvioPage({ searchParams }: EnvioPageProps) {
  const orderId = searchParams?.orderId ?? 'order-mock-001'

  return (
    <Suspense fallback={null}>
      <EnvioClient orderId={orderId} />
    </Suspense>
  )
}
