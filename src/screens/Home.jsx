import { LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Brand'
import { CaregiverCard, PlaceCard } from '../components/Cards'
import { MapView } from '../components/MapView'
import { Avatar } from '../components/ui'
import { CITY } from '../data/city'
import { CAREGIVERS } from '../data/caregivers'
import { PLACES } from '../data/places'
import { firstName, normalize } from '../lib/format'
import { withDistance } from '../lib/places'
import { recommend } from '../lib/reviews'
import { useApp } from '../lib/store'
import { useLocationRequest } from '../lib/useLocationRequest'

const PAGE_SIZE = 3

// Quem está de agenda cheia não entra nas recomendações.
const AVAILABLE_CAREGIVERS = CAREGIVERS.filter((caregiver) => !caregiver.alwaysDeclines)

// Mostra uma janela da lista e volta ao começo quando ela acaba.
const pageOf = (list, page) =>
  Array.from({ length: PAGE_SIZE }, (_, i) => list[(page * PAGE_SIZE + i) % list.length])

function LocationBar({ origin, account }) {
  const { status, request } = useLocationRequest()
  if (origin.source === 'gps') {
    return <p className="location-bar"><LocateFixed size={16} aria-hidden="true" />Perto de você</p>
  }
  const city = account.city
  const hasData = normalize(city) === normalize(CITY.name)
  return (
    <div className="location-bar">
      <MapPin size={16} aria-hidden="true" />
      <span>
        {origin.source === 'manual'
          ? `Perto de ${origin.label}`
          : hasData
            ? `Usando ${city}, a cidade do seu perfil`
            : `Ainda não temos locais em ${city}. Mostrando ${CITY.name}.`}
      </span>
      <button type="button" className="text-button" onClick={request} disabled={status === 'loading'}>
        {status === 'loading' ? 'Localizando…' : 'Ativar localização'}
      </button>
      {status === 'failed' && <span className="location-note">Não conseguimos acessar a sua localização.</span>}
    </div>
  )
}

export default function Home() {
  const { account, db, origin } = useApp()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const places = useMemo(
    () => recommend(withDistance(PLACES, origin), 'place', db.reviews),
    [origin.lat, origin.lng, db.reviews], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const caregivers = useMemo(
    () => recommend(withDistance(AVAILABLE_CAREGIVERS, origin), 'caregiver', db.reviews),
    [origin.lat, origin.lng, db.reviews], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [pet] = account.pets
  const shownPlaces = pageOf(places, page)
  const shownCaregivers = pageOf(caregivers, page)

  return (
    <div className="page">
      <header className="home-head">
        <Logo className="home-logo" />
        <Link to="/perfil" aria-label="Abrir perfil"><Avatar name={account.name} photo={account.photo} size={44} /></Link>
      </header>
      <h1 className="greeting">Oi, {firstName(account.name)}!</h1>
      <p className="lede">
        {pet ? `Para onde vamos com ${pet.name} hoje?` : 'Vamos achar um lugar legal para o seu pet?'}
      </p>
      <LocationBar origin={origin} account={account} />

      <div className="home-map">
        <MapView
          center={origin}
          pins={shownPlaces}
          interactive={false}
          onSelect={(id) => id && navigate(`/locais/${id}`)}
        />
        <Link className="btn btn-primary home-map-cta" to="/locais">Ver mapa completo</Link>
      </div>

      <section aria-labelledby="rec-places">
        <div className="section-head">
          <h2 id="rec-places">Recomendados para você</h2>
          <button type="button" className="text-button" onClick={() => setPage(page + 1)}>
            <RefreshCw size={15} aria-hidden="true" />Ver outros
          </button>
        </div>
        <div className="card-grid">
          {shownPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
        </div>
      </section>

      <section aria-labelledby="rec-care">
        <div className="section-head">
          <h2 id="rec-care">Serviços na região</h2>
          <Link className="text-button" to="/cuidadores">Ver todos</Link>
        </div>
        <div className="card-grid">
          {shownCaregivers.map((caregiver) => <CaregiverCard key={caregiver.id} caregiver={caregiver} />)}
        </div>
      </section>
    </div>
  )
}
