const ORS_API_KEY = process.env.ORS_API_KEY || ''
const PRICE_PER_KM = 50 // $ ARS por km

async function geocode(address: string): Promise<[number, number]> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}&boundary.country=AR&size=1`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding falló: ${res.status}`)
  const data = await res.json()
  const coords = data.features?.[0]?.geometry?.coordinates
  if (!coords) throw new Error(`No se encontró la dirección: ${address}`)
  return coords // [lng, lat]
}

async function getDistanceKm(from: [number, number], to: [number, number]): Promise<number> {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`Directions falló: ${res.status}`)
  const data = await res.json()
  const meters = data.features?.[0]?.properties?.segments?.[0]?.distance
  if (!meters) throw new Error('No se pudo calcular la ruta')
  return meters / 1000
}

export function splitDirecciones(raw: string): string[] {
  // Separa en cada punto donde aparece una calle con número (ej: "Av. Colón 1234")
  // que NO esté al inicio del string
  const dirs = raw
    .split(/,\s*(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ.]+\s+\d)/)
    .map(d => d.trim())
    .filter(Boolean)

  return dirs.length > 0 ? dirs : [raw.trim()]
}

export async function calcularCostoEnvio(
  originAddress: string,
  destAddress:   string
): Promise<number> {
  console.log('[shippingCost] ORS_API_KEY existe:', !!ORS_API_KEY)
  console.log('[shippingCost] originAddress:', JSON.stringify(originAddress), '| destAddress:', JSON.stringify(destAddress))
  if (!ORS_API_KEY) { console.log('[shippingCost] early return: no key'); return 0 }
  if (!originAddress || !destAddress) { console.log('[shippingCost] early return: address vacía'); return 0 }
  if (originAddress.trim() === destAddress.trim()) { console.log('[shippingCost] early return: misma direccion'); return 0 }
  if (originAddress === 'No address') { console.log('[shippingCost] early return: No address'); return 0 }
  try {
    const dirs = splitDirecciones(originAddress)
    console.log('[shippingCost] dirs split:', JSON.stringify(dirs))
    console.log('[shippingCost] geocoding destino...')
    const dest = await geocode(destAddress)
    console.log('[shippingCost] destino geocoded:', dest)

    // Geocodificar todas las origins en paralelo
    console.log('[shippingCost] geocoding origenes...')
    const origenCoords = await Promise.all(dirs.map(d => geocode(d)))
    console.log('[shippingCost] origenes geocoded:', JSON.stringify(origenCoords))

    // Calcular distancia de cada origen al destino
    console.log('[shippingCost] calculando distancias...')
    const distancias = await Promise.all(
      origenCoords.map(from => getDistanceKm(from, dest))
    )
    console.log('[shippingCost] distancias:', JSON.stringify(distancias))

    const maxKm = Math.max(...distancias)
    const costo = Math.round(maxKm * PRICE_PER_KM)
    console.log('[shippingCost] costo final:', costo)
    return costo
  } catch (error) {
    console.error('[shippingCost] Error calculando costo de envío:', error)
    return 0
  }
}