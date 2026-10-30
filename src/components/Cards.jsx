import { Bed, ChevronRight, Coffee, ShieldCheck, Trees, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/places'
import { lowestPrice } from '../lib/care'
import { formatMoney } from '../lib/format'
import { formatDistance } from '../lib/geo'
import { isOpenNow } from '../lib/places'
import { Avatar, FavoriteButton, Rating } from './ui'

const CATEGORY_ICONS = { restaurante: UtensilsCrossed, cafeteria: Coffee, hotel: Bed, parque: Trees }

export const categoryOf = (place) => CATEGORIES.find((item) => item.id === place.category)

export function CategoryTile({ category, size = 56 }) {
  const Icon = CATEGORY_ICONS[category]
  return (
    <span className={`tile tile-${category}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={size * 0.46} />
    </span>
  )
}

export function OpenStatus({ hours }) {
  if (!hours) return null
  const open = isOpenNow(hours)
  return <span className={`status${open ? ' is-open' : ''}`}>{open ? 'Aberto agora' : 'Fechado agora'}</span>
}

export function PlaceCard({ place, selected }) {
  return (
    <article className={`card place-card${selected ? ' is-selected' : ''}`}>
      <CategoryTile category={place.category} />
      <div className="card-body">
        <h3><Link className="card-link" to={`/locais/${place.id}`}>{place.name}</Link></h3>
        <p className="card-meta">{categoryOf(place).singular} · {place.neighborhood}</p>
        <div className="card-row">
          <Rating target={place} kind="place" />
          <span className="status">{formatDistance(place.distance)}</span>
          <OpenStatus hours={place.hours} />
        </div>
      </div>
      <FavoriteButton kind="place" targetId={place.id} name={place.name} />
    </article>
  )
}

export function CaregiverCard({ caregiver, search = '' }) {
  return (
    <article className="card caregiver-card">
      <Avatar name={caregiver.name} />
      <div className="card-body">
        <h3><Link className="card-link" to={`/cuidadores/${caregiver.id}${search}`}>{caregiver.name}</Link></h3>
        <p className="card-meta">{caregiver.neighborhood} · a partir de {formatMoney(lowestPrice(caregiver))}</p>
        <div className="card-row">
          <Rating target={caregiver} kind="caregiver" />
          <span className="verified"><ShieldCheck size={15} aria-hidden="true" />Verificado</span>
        </div>
      </div>
      <FavoriteButton kind="caregiver" targetId={caregiver.id} name={caregiver.name} />
    </article>
  )
}

export function ListLink({ to, icon: Icon, title, detail }) {
  return (
    <Link className="list-link" to={to}>
      <span className="list-link-icon"><Icon size={20} aria-hidden="true" /></span>
      <span className="list-link-text">
        <b>{title}</b>
        {detail && <small>{detail}</small>}
      </span>
      <ChevronRight size={20} aria-hidden="true" />
    </Link>
  )
}
