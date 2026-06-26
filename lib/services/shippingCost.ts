const ORS_API_KEY = process.env.ORS_API_KEY || ''
const PRICE_PER_KM = 50 // $ ARS por km
const MIN_SHIPPING_COST = 100

async function geocode(address: string): Promise<[number, number]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=ar`
  const res  = await fetch(url, { headers: { 'User-Agent': 'ZapasYa-Payments/1.0' } })
  if (!res.ok) {
    console.error('[geocode] HTTP error:', res.status, address)
    throw new Error(`Geocoding falló: ${res.status}`)
  }
  const data = await res.json()
  if (!data?.length) {
    console.error('[geocode] no results for:', address)
    throw new Error(`No se encontró la dirección: ${address}`)
  }
  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  return [lon, lat] // [lng, lat] (ORS espera lng,lat)
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
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean)
  const result: string[] = []
  for (const part of parts) {
    if (/\d/.test(part)) {
      result.push(part)
    } else if (result.length > 0) {
      result[result.length - 1] += ', ' + part
    } else {
      result.push(part)
    }
  }
  return result.length > 0 ? result : [raw.trim()]
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
    const origenCoords: [number, number][] = []
    for (const d of dirs) {
      const coords = await geocode(d)
      origenCoords.push(coords)
      await new Promise(r => setTimeout(r, 300))
    }
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