// app/page.tsx
import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'
import { getOrder } from '@/lib/services/buyerApp'
import PaymentClient from './paymentClient'

interface Props {
  searchParams: Promise<{ orderId?: string; userId?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  // Si es admin, redirigir al dashboard
  const role = await getRole()
  if (role === 'admin') redirect('/admin/dashboard')

  const { orderId = 'order-mock-001', userId = 'user-mock-001' } = await searchParams

  // getOrder ya trae todo: items con name, price, size, color, imageUrl
  const order = await getOrder(orderId)

  return (
    <PaymentClient
      orderId={orderId}
      userId={userId}
      order={order}
    />
  )
}