'use server'
import { auth } from '@clerk/nextjs/server'
import { generateShipmentToken } from '@/lib/shipmentToken'

export async function getTrackingUrl(orderId: string, userId?: string): Promise<string> {
  // Si nos pasaron userId desde sessionStorage, confiamos en él
  // (fue seteado por page.tsx tras verificar el token original)
  if (userId) {
    const token = await generateShipmentToken({ clerkId: userId, orderId })
    return `${process.env.NEXT_PUBLIC_SHIPPING_APP_URL}/dashboard/shipments/${orderId}?token=${token}`
  }

  // Fallback a Clerk si no hay userId
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('No autenticado')

  const token = await generateShipmentToken({ clerkId: clerkUserId, orderId })
  return `${process.env.NEXT_PUBLIC_SHIPPING_APP_URL}/dashboard/shipments/${orderId}?token=${token}`
}