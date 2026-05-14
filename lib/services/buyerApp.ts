// lib/services/buyerApp.ts
// Llamadas a Buyer App:
// GET /orders/{id}
// GET /users/{id}

const BUYER_APP_URL = process.env.NEXT_PUBLIC_BUYER_APP_URL || ''

const MOCK_ORDER = {
  id:       'order-mock-001',
  userId:   'user-mock-001',
  total:    17099,
  discount: 1900,
  shipping: 0,
  status:   'PENDING',
  items: [
    {
      id:        'item-mock-001',
      orderId:   'order-mock-001',
      productId: 'prod-mock-001',
      name:      'Zapatillas UltraSprint',
      quantity:  1,
      price:     18999,
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

export async function getOrder(orderId: string) {
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