// lib/services/buyerApp.ts
// Llamadas a Buyer App:
// GET /orders/{id}
// GET /users/{id}
//
// El mock refleja la estructura real que manda la buyer app.

const BUYER_APP_URL = process.env.NEXT_PUBLIC_BUYER_APP_URL || ''

interface OrderItem {
  name:     string
  price:    number
  quantity: number
  size:     number
  color:    string | null
  imageUrl: string | null
}

interface Order {
  id:       string
  userId:   string
  total:    number
  discount: number
  shipping: number
  status:   string
  address:  string
  originAddress: string
  carrier:  'MAIL' | 'PICKUP'
  items:    OrderItem[]
}

const MOCK_ORDER: Order = {
  id:       'order-mock-001',
  userId:   'user-mock-001',
  total:    249999,
  discount: 10000,
  shipping: 0,
  status:   'PENDING',
  address:  'Av. Rivadavia 3450, Buenos Aires, 1204',
  originAddress: 'Av. Corrientes 1234, Buenos Aires, 1043',
  carrier:  'MAIL',
  items: [
    {
      name:     'Nike Dunk High Retro Premium',
      price:    259999,
      quantity: 1,
      size:     42,
      color:    'Negro',
      imageUrl: '/zapatillas/zapatillas-jordan.webp',
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

export async function getOrder(orderId: string): Promise<Order> {
  if (!BUYER_APP_URL) return MOCK_ORDER
  try {
    const res = await fetch(`${BUYER_APP_URL}/orders/${orderId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_ORDER
  }
}

export async function getUser(userId: string) {
  if (!BUYER_APP_URL) return MOCK_USER
  try {
    const res = await fetch(`${BUYER_APP_URL}/users/${userId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_USER
  }
}