const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

// Datas de <input type="date"> são tratadas como dia local, nunca como UTC.
export function parseDay(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toDayInput(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const formatDay = (iso) => dayFormat.format(parseDay(iso.slice(0, 10))).replace('.', '')

export function formatPeriod(start, end) {
  return end && end !== start ? `${formatDay(start)} a ${formatDay(end)}` : formatDay(start)
}

export const formatMoney = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const formatRating = (value) => value.toFixed(1).replace('.', ',')

export const firstName = (name) => name.trim().split(/\s+/)[0]

export function initials(name) {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export const normalize = (text) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`
