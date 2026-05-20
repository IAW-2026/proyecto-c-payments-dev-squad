// app/payments/page.tsx
// Server Component — fetcha order + producto y pasa los datos al client component.
// Acepta ?orderId=xxx&userId=xxx — si no vienen, usa los mocks.
import { getOrder } from '@/lib/services/buyerApp'
import { getProduct } from '@/lib/services/sellerApp'
import PaymentClient from './paymentClient'
//IMPORTS PARA REDIRECCIÓN CON BASE EN ROL
import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'

interface Props {
  searchParams: Promise<{ orderId?: string; userId?: string }>
}

export default async function PaymentsPage({ searchParams }: Props) {
  // Si el usuario es admin, lo redirigimos al dashboard de admin
   const role = await getRole()
  if (role === 'admin') redirect('/admin/dashboard')

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