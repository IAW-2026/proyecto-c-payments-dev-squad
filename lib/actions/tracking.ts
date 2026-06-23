'use server'
import { auth } from '@clerk/nextjs/server'
import { generateShipmentToken } from '@/lib/shipmentToken'
import { verifyPaymentToken } from '@/lib/paymentToken'

export async function getTrackingUrl(orderId: string, paymentToken?: string): Promise<string> {
  let userId: string | null = null

  // Intentar con sesión de Clerk primero
  try {
    const { userId: clerkUserId } = await auth()
    userId = clerkUserId
  } catch {}

  // Fallback a token si no hay sesión de Clerk
  if (!userId && paymentToken) {
    const verified = await verifyPaymentToken(paymentToken, orderId)
    if (verified) {
      userId = verified.userId
    }
  }

  if (!userId) throw new Error('No autenticado')

  const token = await generateShipmentToken({ userId, orderId })
  return `${process.env.NEXT_PUBLIC_SHIPPING_APP_URL}/dashboard/shipments/${orderId}?token=${token}`
}