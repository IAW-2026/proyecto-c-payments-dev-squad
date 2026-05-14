// lib/services/shippingApp.ts
// Llamadas a Shipping App:
// POST /shipments
// GET /shipments/{order_id}
// GET /shipments/{order_id}/tracking

const SHIPPING_APP_URL = process.env.NEXT_PUBLIC_SHIPPING_APP_URL || ''

const MOCK_SHIPMENT = {
  id:                'ship-mock-001',
  orderId:           'order-mock-001',
  buyerId:           'user-mock-001',
  status:            'en_camino',
  carrier:           'correo_argentino',
  address: {
    street: 'Av. Rivadavia 3450',
    city:   'Buenos Aires',
    zip:    '1204',
  },
  estimatedDelivery: '2026-05-17',
  shippedAt:         '2026-05-14T09:22:00Z',
  deliveredAt:       null,
}

const MOCK_TRACKING = [
  {
    id:          'track-mock-001',
    shipmentId:  'ship-mock-001',
    status:      'pendiente',
    description: 'Pago aprobado — pedido confirmado',
    timestamp:   '2026-05-13T14:38:00Z',
  },
  {
    id:          'track-mock-002',
    shipmentId:  'ship-mock-001',
    status:      'en_preparacion',
    description: 'El vendedor preparó el paquete',
    timestamp:   '2026-05-13T16:10:00Z',
  },
  {
    id:          'track-mock-003',
    shipmentId:  'ship-mock-001',
    status:      'en_camino',
    description: 'En tránsito hacia destino',
    timestamp:   '2026-05-14T09:22:00Z',
  },
]

export async function postShipment(payload: {
  orderId:  string
  buyerId:  string
  sellerId: string
  items:    { productId: string; quantity: number }[]
  address:  { street: string; city: string; zip: string }
  carrier?: string
}) {
  if (!SHIPPING_APP_URL) return MOCK_SHIPMENT
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SHIPMENT
  }
}

export async function getShipment(orderId: string) {
  if (!SHIPPING_APP_URL) return MOCK_SHIPMENT
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments/${orderId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SHIPMENT
  }
}

export async function getTracking(orderId: string) {
  if (!SHIPPING_APP_URL) return MOCK_TRACKING
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments/${orderId}/tracking`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_TRACKING
  }
}