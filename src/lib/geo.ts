export type LatLng = { lat: number; lng: number }

/** Default “you are here” when GPS is unavailable — Siam, Bangkok. */
export const BANGKOK_CENTER: LatLng = { lat: 13.746, lng: 100.5347 }

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60))
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  return rem ? `${hours}h ${rem}m` : `${hours}h`
}

export type WalkingRoute = {
  geometry: GeoJSON.LineString
  distanceM: number
  durationSec: number
}

export async function fetchWalkingRoute(
  from: LatLng,
  to: LatLng,
  token: string,
): Promise<WalkingRoute> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/walking/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?geometries=geojson&overview=full&access_token=${token}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Directions failed (${res.status})`)
  }
  const data = (await res.json()) as {
    routes?: Array<{
      distance: number
      duration: number
      geometry: GeoJSON.LineString
    }>
  }
  const route = data.routes?.[0]
  if (!route) throw new Error('No walking route found')
  return {
    geometry: route.geometry,
    distanceM: route.distance,
    durationSec: route.duration,
  }
}
