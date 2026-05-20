// lib/services/shippingApp.ts
// Llamadas a Shipping App:
// POST /shipments          → crea el envío pasando la orden completa
// GET  /shipments/{order_id}
// GET  /shipments/{order_id}/tracking

const SHIPPING_APP_URL = process.env.NEXT_PUBLIC_SHIPPING_APP_URL || ''

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
  carrier:  'MAIL' | 'PICKUP'
  items:    OrderItem[]
}

interface Shipment {
  id:                string
  orderId:           string
  buyerId:           string
  status:            string
  carrier:           string
  address:           string
  estimatedDelivery: string | null
  shippedAt:         string | null
  deliveredAt:       string | null
}

interface TrackingEvent {
  id:          string
  shipmentId:  string
  status:      string
  description: string
  timestamp:   string
}

const MOCK_SHIPMENT: Shipment = {
  id:                'ship-mock-001',
  orderId:           'order-mock-001',
  buyerId:           'user-mock-001',
  status:            'en_camino',
  carrier:           'MAIL',
  address:           'Av. Rivadavia 3450, Buenos Aires, 1204',
  estimatedDelivery: '2026-05-17',
  shippedAt:         '2026-05-14T09:22:00Z',
  deliveredAt:       null,
}

const MOCK_TRACKING: TrackingEvent[] = [
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

/**
 * Crea el envío pasando la orden completa — shipping saca la dirección
 * y el carrier de ahí directamente.
 */
export async function postShipment(order: Order): Promise<Shipment> {
  if (!SHIPPING_APP_URL) return { ...MOCK_SHIPMENT, orderId: order.id, buyerId: order.userId, carrier: order.carrier, address: order.address }
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(order),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return { ...MOCK_SHIPMENT, orderId: order.id, buyerId: order.userId, carrier: order.carrier, address: order.address }
  }
}

export async function getShipment(orderId: string): Promise<Shipment> {
  if (!SHIPPING_APP_URL) return MOCK_SHIPMENT
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments/${orderId}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_SHIPMENT
  }
}

export async function getTracking(orderId: string): Promise<TrackingEvent[]> {
  if (!SHIPPING_APP_URL) return MOCK_TRACKING
  try {
    const res = await fetch(`${SHIPPING_APP_URL}/shipments/${orderId}/tracking`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return MOCK_TRACKING
  }
}