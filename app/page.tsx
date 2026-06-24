import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getRole } from '@/lib/auth'
import { Order, MOCK_ORDER, getOrder, calcularTotalOrden } from '@/lib/services/buyerApp'
import { calcularCostoEnvio } from '@/lib/services/shippingCost'
import { verifyPaymentToken } from '@/lib/paymentToken'
import PaymentClient from './paymentClient'

interface Props {
  searchParams: Promise<{ orderId?: string; token?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  const role = await getRole()
  if (role === 'admin') redirect('/admin/dashboard')

  const { orderId = 'order-mock-001', token } = await searchParams

  if (!orderId || orderId.includes('.')) {
    redirect('/')
  }

  const { userId: clerkUserId } = await auth()
  let userId = clerkUserId

  // Token tiene prioridad sobre sesión de Clerk
  if (token && orderId) {
    const verified = await verifyPaymentToken(token, orderId)
    if (verified) {
      userId = verified.clerkId
    }
  }

  if (!userId) redirect('/sign-in')

  let order = orderId ? await getOrder(orderId) : null
  if (!order) {
    order = { ...MOCK_ORDER, id: orderId, userId }
  } else {
    order.userId = userId
  }

  if ((order.carrier ?? 'MAIL') === 'MAIL' && order.shipping === 0) {
    order.shipping = await calcularCostoEnvio(order.originAddress, order.address)
  }
  order.total = calcularTotalOrden(order)

  return (
    <PaymentClient
      orderId={orderId}
      userId={userId}
      order={order}
    />
  )
}