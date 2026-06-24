const ORS_API_KEY = process.env.ORS_API_KEY || ''
const PRICE_PER_KM = 50 // $ ARS por km
const MIN_SHIPPING_COST = 100

async function geocode(address: string): Promise<[number, number]> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}&boundary.country=AR&size=1`
  const res  = await fetch(url)
  if (!res.ok) {
    console.error('[geocode] HTTP error:', res.status, address)
    throw new Error(`Geocoding falló: ${res.status}`)
  }
  const data = await res.json()
  const coords = data.features?.[0]?.geometry?.coordinates
  if (!coords) {
    console.error('[geocode] no results for:', address, 'response:', JSON.stringify(data).slice(0, 300))
    throw new Error(`No se encontró la dirección: ${address}`)
  }
  return coords // [lng, lat]
}

async function getDistanceKm(from: [number, number], to: [number, number]): Promise<number> {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`
  const res  = await fetch(url)
  if (!res.ok) {
    console.error('[getDistanceKm] HTTP error:', res.status)
    throw new Error(`Directions falló: ${res.status}`)
  }
  const data = await res.json()
  const meters = data.features?.[0]?.properties?.segments?.[0]?.distance
  if (!meters) {
    console.log('[getDistanceKm] no route data:', JSON.stringify(data).slice(0, 300))
  }
  return meters ? meters / 1000 : 0
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
  if (!ORS_API_KEY) return 0
  if (!originAddress || !destAddress) return 0
  if (originAddress === 'No address') return 0
  try {
    const dirs = splitDirecciones(originAddress)
    const dest = await geocode(destAddress)
    const origenCoords = await Promise.all(dirs.map(d => geocode(d)))
    const distancias = await Promise.all(
      origenCoords.map(from => getDistanceKm(from, dest))
    )
    const maxKm = Math.max(...distancias)
    return Math.max(MIN_SHIPPING_COST, Math.round(maxKm * PRICE_PER_KM))
  } catch (error) {
    console.error('[calcularCostoEnvio] error:', error, { originAddress, destAddress })
    return MIN_SHIPPING_COST
  }
}