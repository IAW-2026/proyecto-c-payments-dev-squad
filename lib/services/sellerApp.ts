// lib/services/sellerApp.ts
// Llamadas a Seller App:
// GET  /sellers/{id}   → datos del vendedor (para que MP le transfiera)
// POST /sales          → confirmar venta al vendedor

const SELLER_APP_URL = process.env.NEXT_PUBLIC_SELLER_APP_URL || ''

interface Seller {
  id:         string
  name:       string
  email:      string
  mpAccountId: string  // ID de cuenta MP del vendedor — para split de pagos
}

interface Sale {
  id:       string
  sellerId: string
  orderId:  string
  status:   string
  total:    number
}

const MOCK_SELLER: Seller = {
  id:          'seller-mock-001',
  name:        'UltraSprint Store',
  email:       'ventas@ultrasprint.com',
  mpAccountId: 'MP_COLLECTOR_MOCK_001',
}

const MOCK_SALE: Sale = {
  id:       'sale-mock-001',
  sellerId: 'seller-mock-001',
  orderId:  'order-mock-001',
  status:   'confirmed',
  total:    17099,
}

/**
 * Obtiene los datos del vendedor — necesario para saber a qué cuenta MP
 * transferirle el monto correspondiente.
 */
export async function getSeller(sellerId: string): Promise<Seller> {
  if (!SELLER_APP_URL) return MOCK_SELLER
  try {
    const res = await fetch(`${SELLER_APP_URL}/sellers/${sellerId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SELLER
  }
}

/**
 * Notifica al seller que la venta fue confirmada, indicando el monto
 * que le corresponde. MP se encarga de la transferencia via marketplace.
 */
export async function postSale(payload: {
  orderId:  string
  sellerId: string
  total:    number
}): Promise<Sale> {
  if (!SELLER_APP_URL) return { ...MOCK_SALE, orderId: payload.orderId, total: payload.total }
  try {
    const res = await fetch(`${SELLER_APP_URL}/sales`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return { ...MOCK_SALE, orderId: payload.orderId, total: payload.total }
  }
}