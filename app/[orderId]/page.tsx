import { redirect } from 'next/navigation'
import { verifyPaymentToken } from '@/lib/paymentToken'

interface Props {
  params:       Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string; theme?: string }>
}

export default async function OrderRedirect({ params, searchParams }: Props) {
  const { orderId } = await params
  const { token, theme } = await searchParams

  if (token) {
    const verified = await verifyPaymentToken(token, orderId)
    if (verified) {
      const params = new URLSearchParams({ orderId, token })
      if (theme === 'light' || theme === 'dark') params.set('theme', theme)
      redirect(`/?${params}`)
    }
  }

  redirect(`/sign-in?redirect_url=/${encodeURIComponent(orderId)}`)
}