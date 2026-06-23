import { redirect } from 'next/navigation'
import { verifyShipmentToken } from '@/lib/shipmentToken'

interface Props {
  params:       Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function OrderRedirect({ params, searchParams }: Props) {
  const { orderId } = await params
  const { token }   = await searchParams

  if (token) {
    const verified = await verifyShipmentToken(token, orderId)
    if (verified) {
      redirect(`/api/auth/signout?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`)
    }
  }

  redirect(`/sign-in?redirect_url=/${encodeURIComponent(orderId)}`)
}