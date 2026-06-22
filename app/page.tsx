import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getRole } from '@/lib/auth'
import { Order, MOCK_ORDER, getOrder, calcularTotalOrden } from '@/lib/services/buyerApp'
import { calcularCostoEnvio } from '@/lib/services/shippingCost'
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

  if (!orderId || orderId.includes('.')) {
    redirect('/')
  }
  // Intentar obtener la orden desde Buyer App (Sofi expuso GET /api/orders/[id])
  let order = orderId ? await getOrder(orderId) : null
  if (!order) {
    // Fallback a MOCK_ORDER si Buyer App no responde o no hay BUYER_APP_URL
    order = { ...MOCK_ORDER, id: orderId, userId }
  } else {
    order.userId = userId
  }

  // Calcular costo de envío solo si es MAIL y shipping es 0,
  // luego recalcular el total desde los items, el envío y el descuento.
  if (order.shipping === 0) {
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