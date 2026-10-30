import { parseDay } from './format'

const WEEKDAYS = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados']
const DAY_MS = 86_400_000

export function countDays(start, end) {
  if (!end) return 1
  return Math.round((parseDay(end) - parseDay(start)) / DAY_MS) + 1
}

export function isAvailable(caregiver, start, end) {
  if (!start) return true
  const firstDay = parseDay(start).getDay()
  // Uma semana já passa por todos os dias, então não precisa olhar além disso.
  const days = Math.min(countDays(start, end), 7)
  return !Array.from({ length: days }, (_, i) => (firstDay + i) % 7).some((day) =>
    caregiver.daysOff.includes(day),
  )
}

export const offersService = (caregiver, serviceId) =>
  caregiver.services.some((service) => service.id === serviceId)

export function filterCaregivers(caregivers, { service, neighborhood, start, end }) {
  return caregivers.filter(
    (caregiver) =>
      (!service || offersService(caregiver, service)) &&
      (!neighborhood || caregiver.neighborhood === neighborhood) &&
      isAvailable(caregiver, start, end),
  )
}

export function totalPrice(caregiver, serviceId, start, end) {
  const service = caregiver.services.find((item) => item.id === serviceId)
  return service ? service.price * countDays(start, end) : 0
}

export const lowestPrice = (caregiver) =>
  Math.min(...caregiver.services.map((service) => service.price))

export function daysOffLabel(caregiver) {
  const days = caregiver.daysOff.map((day) => WEEKDAYS[day])
  return days.length ? `Não atende aos ${days.join(' e ')}.` : 'Atende todos os dias.'
}

// Decisão "Cuidador aceitou?" do fluxo Contratar cuidador.
export function decideRequest(caregiver, start, end) {
  return !caregiver.alwaysDeclines && isAvailable(caregiver, start, end) ? 'confirmado' : 'recusado'
}
