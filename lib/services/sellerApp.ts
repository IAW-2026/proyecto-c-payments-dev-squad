// lib/services/sellerApp.ts
// Llamadas a Seller App:
// GET  /api/seller/{id}  → datos del vendedor
// POST /api/sales        → confirmar venta al vendedor

const SELLER_APP_URL = process.env.NEXT_PUBLIC_SELLER_APP_URL || ''
const SELLER_API_KEY = process.env.SELLER_API_KEY || ''

interface Seller {
  id:          string
  name:        string
  email:       string
  mpAccountId: string
}

interface Sale {
  id:       string
  sellerId: string
  orderId:  string
  status:   string
  total:    number
}

const MOCK_SELLER: Seller = {
  id:          '5c68448c-0c67-4d71-915a-f5e51ddbc259',
  name:        'Lady Gaga',
  email:       'lady.gaga.vendedora@gmail.com',
  mpAccountId: 'MP_COLLECTOR_MOCK_001',
}

const MOCK_SALE: Sale = {
  id:       'sale-mock-001',
  sellerId: 'seller-mock-001',
  orderId:  'order-mock-001',
  status:   'confirmed',
  total:    17099,
}

function sellerHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (SELLER_API_KEY) {
    headers['x-internal-api-key'] = SELLER_API_KEY
  }

  if (process.env.SELLER_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] =
      process.env.SELLER_BYPASS_SECRET
  }

  return headers
}

export async function getSeller(sellerId: string): Promise<Seller> {
  if (!SELLER_APP_URL) return MOCK_SELLER
  try {
    const res = await fetch(`${SELLER_APP_URL}/api/seller/${sellerId}`, {
      headers: sellerHeaders(),
    })
    if (!res.ok) throw new Error(`Seller API error: ${res.status}`)
    return await res.json()
  } catch {
    return MOCK_SELLER
  }
}

export async function postSale(payload: {
  orderId:  string
  sellerId: string
  total:    number
  items?:   { productId: string; quantity: number; price: number }[]
}): Promise<Sale> {
  if (!SELLER_APP_URL) return { ...MOCK_SALE, orderId: payload.orderId, total: payload.total }
  try {
    const res = await fetch(`${SELLER_APP_URL}/api/sales`, {
      method:  'POST',
      headers: sellerHeaders(),
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Seller API error: ${res.status}`)
    return await res.json()
  } catch(e) {
    console.error('[postSale] error:', e)
    return { ...MOCK_SALE, orderId: payload.orderId, total: payload.total }
  }
}