import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getRole } from '@/lib/auth'
import { getOrder } from '@/lib/services/buyerApp'
import PaymentClient from './paymentClient'

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  const role = await getRole()
  if (role === 'admin') redirect('/admin/dashboard')

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { orderId = 'order-mock-001' } = await searchParams
  const order = await getOrder(orderId)

  return (
    <PaymentClient
      orderId={orderId}
      userId={userId}
      order={order}
    />
  )
}