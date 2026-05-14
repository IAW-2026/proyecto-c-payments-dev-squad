// app/payments/page.tsx
// Server Component — fetcha order + producto y pasa los datos al client component.
// Acepta ?orderId=xxx&userId=xxx — si no vienen, usa los mocks.
import { getOrder } from '@/lib/services/buyerApp'
import { getProduct } from '@/lib/services/sellerApp'
import PaymentClient from './paymentClient'

interface Props {
  searchParams: Promise<{ orderId?: string; userId?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  const { orderId = 'order-mock-001', userId = 'user-mock-001' } = await searchParams

  // Ambos servicios devuelven su MOCK si la env URL no está configurada
  const order = await getOrder(orderId)
  const product = await getProduct(order.items[0]?.productId ?? 'prod-mock-001')

  return (
    <PaymentClient
      orderId={orderId}
      userId={userId}
      order={order}
      product={product}
    />
  )
}