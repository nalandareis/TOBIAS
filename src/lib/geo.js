import { CITY, NEIGHBORHOODS } from '../data/city'
import { normalize } from './format'

// Acima dessa distância de Aracaju, a localização real não ajuda: os dados são de lá.
const DEMO_RADIUS_KM = 60

const toRadians = (degrees) => (degrees * Math.PI) / 180

export function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

export const isInDemoArea = (point) => distanceKm(point, CITY) <= DEMO_RADIUS_KM

// Aceita só o bairro ou um endereço que cite o bairro.
export function findNeighborhood(text) {
  const query = normalize(text)
  if (!query) return null
  return NEIGHBORHOODS.find((item) => query.includes(normalize(item.name))) ?? null
}

export function resolveOrigin(account) {
  const location = account?.location
  if (location?.status === 'granted' && !location.outside) {
    return { lat: location.lat, lng: location.lng, label: 'Sua localização', source: 'gps' }
  }
  if (location?.status === 'manual') {
    return { lat: location.lat, lng: location.lng, label: location.label, source: 'manual' }
  }
  return {
    lat: CITY.lat,
    lng: CITY.lng,
    label: CITY.name,
    source: 'city',
    outside: Boolean(location?.outside),
  }
}
