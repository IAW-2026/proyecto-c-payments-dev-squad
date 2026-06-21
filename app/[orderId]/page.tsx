import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function OrderRedirect({ params }: Props) {
  const { orderId } = await params
  redirect(`/?orderId=${encodeURIComponent(orderId)}`)
}
