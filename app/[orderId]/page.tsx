import { redirect } from 'next/navigation'
import { verifyPaymentToken } from '@/lib/paymentToken'

interface Props {
  params:       Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function OrderRedirect({ params, searchParams }: Props) {
  const { orderId } = await params
  const { token }   = await searchParams

  if (token) {
    const verified = await verifyPaymentToken(token, orderId)
    if (verified) {
      redirect(`/?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`)
    }
  }

  redirect(`/sign-in?redirect_url=/${encodeURIComponent(orderId)}`)
}