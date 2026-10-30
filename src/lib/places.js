import { distanceKm } from './geo'

const SPECIES_PLURAL = { cao: 'cães', gato: 'gatos' }
const SIZE_LABELS = { pequeno: 'pequeno', medio: 'médio', grande: 'grande' }

export function withDistance(items, origin) {
  return items
    .map((item) => ({ ...item, distance: distanceKm(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
}

export function filterPlaces(places, { category, maxKm }) {
  return places.filter(
    (place) =>
      (!category || place.category === category) && (!maxKm || place.distance <= maxKm),
  )
}

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function isOpenNow(hours, now = new Date()) {
  if (hours.closedDays.includes(now.getDay())) return false
  const minutes = now.getHours() * 60 + now.getMinutes()
  return minutes >= toMinutes(hours.open) && minutes <= toMinutes(hours.close)
}

const listNames = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}` : names[0]

// Decisão "Local atende o pet?" do fluxo Buscar locais.
export function checkPetFit(place, pet) {
  const speciesList = listNames(place.species.map((id) => SPECIES_PLURAL[id]))
  if (!place.species.includes(pet.species)) {
    return { ok: false, reason: `Este local recebe apenas ${speciesList}.` }
  }
  if (pet.size && !place.sizes.includes(pet.size)) {
    const sizes = listNames(place.sizes.map((id) => SIZE_LABELS[id]))
    return { ok: false, reason: `Aceita somente porte ${sizes}.` }
  }
  const size = pet.size ? ` de porte ${SIZE_LABELS[pet.size]}` : ''
  return { ok: true, reason: `Aceita ${SPECIES_PLURAL[pet.species]}${size}.` }
}
