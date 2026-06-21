// lib/services/buyerApp.ts
const BUYER_APP_URL = process.env.BUYER_APP_URL || process.env.NEXT_PUBLIC_BUYER_APP_URL || ''
const BUYER_API_KEY = process.env.BUYER_API_KEY || ''

export interface OrderItem {
  name:      string
  price:     number
  quantity:  number
  size:      number
  color:     string | null
  imageUrl:  string | null
  productId: string
  sellerId?: string
}

export interface Order {
  id:            string
  userId:        string
  total:         number
  discount:      number
  shipping:      number
  status:        string
  address:       string
  originAddress: string
  carrier:       'MAIL' | 'PICKUP'
  items:         OrderItem[]
}

export const MOCK_ORDER: Order = {
  id:            'order-mock-001',
  userId:        'user-mock-001',
  total:         419998.98,
  discount:      10000,
  shipping:      0,
  status:        'PENDING',
  address:       'Av. Rivadavia 3450, Buenos Aires, 1204',
  originAddress: 'Av. Corrientes 1234, Buenos Aires, 1043',
  carrier:       'MAIL',
  items: [
    {
      name:      'Gaga running Ultimate edition',
      price:     419998.98,
      quantity:  1,
      size:      42,
      color:     'Negro',
      imageUrl:  'https://ae-pic-a1.aliexpress-media.com/kf/S6a1568c7575f4e59b475db8ca8d22bc9C.jpg',
      productId: '5b01cc09-71cb-4ef9-ae54-a4c2002924cb',
      sellerId:  'user_3DpOYfSLrQPxMxBXGccpbrQ1Ahd',
    },
  ],
}

const MOCK_USER = {
  id:        'user-mock-001',
  clerkId:   'clerk_mock_001',
  email:     'comprador@zapasya.com',
  firstName: 'Ángel',
  lastName:  'Fernández',
}

function buyerHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (BUYER_API_KEY) headers['buyer-key'] = BUYER_API_KEY
  return headers
}

export function calcularTotalOrden(order: Order): number {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return subtotal + order.shipping - order.discount
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!BUYER_APP_URL) return null
  try {
    const res = await fetch(`${BUYER_APP_URL}/api/orders/${orderId}`, {
      method:  'GET',
      headers: buyerHeaders(),
    })
    console.log('[getOrder] status:', res.status, 'url:', res.url)
    if (!res.ok) {
      const text = await res.text()
      console.log('[getOrder] error body:', text)
      return null
    }
    const data = await res.json()
    console.log('[getOrder] data recibida:', JSON.stringify(data).slice(0, 200))
    return data
  } catch (e) {
    console.error('[getOrder] error:', e)
    return null
  }
}

export async function postOrder(order: Order): Promise<Order> {
  if (!BUYER_APP_URL) return order
  try {
    const res = await fetch(`${BUYER_APP_URL}/api/orders`, {
      method:  'POST',
      headers: buyerHeaders(),
      body:    JSON.stringify(order),
    })
    if (!res.ok) throw new Error(`Buyer API error: ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('[postOrder] error:', e)
    return order
  }
}

export async function postTransaction(payload: {
  orderId: string
  userId:  string
  pagoId:  string
  estado:  'APROBADO' | 'RECHAZADO' | 'PENDIENTE'
}) {
  if (!BUYER_APP_URL) return { ok: true }
  try {
    const res = await fetch(`${BUYER_APP_URL}/api/transactions`, {
      method:  'POST',
      headers: buyerHeaders(),
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Buyer API error: ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('[postTransaction] error:', e)
    return { ok: true }
  }
}

export async function patchOrderStatus(orderId: string, status: string) {
  if (!BUYER_APP_URL) return { ok: true }
  try {
    const res = await fetch(`${BUYER_APP_URL}/api/orders/${orderId}`, {
      method:  'PATCH',
      headers: buyerHeaders(),
      body:    JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`Buyer API error: ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('[patchOrderStatus] error:', e)
    return { ok: true }
  }
}