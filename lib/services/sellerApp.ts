// lib/services/sellerApp.ts
// Llamadas a Seller App:
// POST /sales
// GET /sales/{id}
// GET /products/{id}

const SELLER_APP_URL = process.env.NEXT_PUBLIC_SELLER_APP_URL || ''

const MOCK_PRODUCT = {
  id:          'prod-mock-001',
  name:        'Zapatillas UltraSprint',
  description: 'Zapatilla de running de edición limitada con suela de carbono.',
  price:       18999,
  stock:       5,
  brand:       'UltraSprint',
  category:    'Running',
  image:       'https://images.unsplash.com/photo-1600185360814-bae279f266f7?auto=format&fit=crop&w=200&q=80',
  sizes:       [40, 41, 42, 43, 44],
  sellerId:    'seller-mock-001',
}

const MOCK_SALE = {
  id:       'sale-mock-001',
  sellerId: 'seller-mock-001',
  orderId:  'order-mock-001',
  status:   'confirmed',
  total:    17099,
  items: [
    {
      productId: 'prod-mock-001',
      quantity:  1,
      price:     18999,
    },
  ],
}

export async function getProduct(productId: string) {
  if (!SELLER_APP_URL) return MOCK_PRODUCT
  try {
    const res = await fetch(`${SELLER_APP_URL}/products/${productId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_PRODUCT
  }
}

export async function postSale(payload: {
  orderId:   string
  sellerId:  string
  paymentId: string
  total:     number
  items:     { productId: string; quantity: number; price: number }[]
}) {
  if (!SELLER_APP_URL) return MOCK_SALE
  try {
    const res = await fetch(`${SELLER_APP_URL}/sales`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SALE
  }
}

export async function getSale(saleId: string) {
  if (!SELLER_APP_URL) return MOCK_SALE
  try {
    const res = await fetch(`${SELLER_APP_URL}/sales/${saleId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SALE
  }
}