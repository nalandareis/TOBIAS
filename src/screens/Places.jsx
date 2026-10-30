import { AlertTriangle, CheckCircle2, Clock, Compass, Info, LocateFixed, MapPin, Navigation, PawPrint, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CategoryTile, categoryOf, OpenStatus, PlaceCard } from '../components/Cards'
import { MapView } from '../components/MapView'
import { Chips, EmptyState, FavoriteButton, Rating, ReviewList, TextField, TopBar, useFocusFirstError } from '../components/ui'
import { NEIGHBORHOODS } from '../data/city'
import { CATEGORIES, DISTANCES, PLACES } from '../data/places'
import { distanceKm, findNeighborhood, formatDistance } from '../lib/geo'
import { checkPetFit, filterPlaces, withDistance } from '../lib/places'
import { reviewsOf } from '../lib/reviews'
import { useApp } from '../lib/store'
import { useLocationRequest } from '../lib/useLocationRequest'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todos' },
  ...CATEGORIES.map((item) => ({ value: item.id, label: item.label })),
]
const DISTANCE_OPTIONS = [
  { value: '', label: 'Qualquer distância' },
  ...DISTANCES.map((km) => ({ value: String(km), label: `Até ${km} km` })),
]

function LocationPrompt() {
  const { setLocation } = useApp()
  const { status, request } = useLocationRequest()
  const [manual, setManual] = useState(false)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState({})
  const formRef = useFocusFirstError(errors)

  function handleManual(event) {
    event.preventDefault()
    const neighborhood = findNeighborhood(text)
    if (!neighborhood) {
      setErrors({ text: 'Não achamos esse bairro em Aracaju. Tente Jardins, Atalaia ou Centro.' })
      return
    }
    setLocation({ status: 'manual', lat: neighborhood.lat, lng: neighborhood.lng, label: neighborhood.name })
  }

  if (manual || status === 'failed') {
    return (
      <div className="page page-narrow">
        <h1 className="page-title">Onde você está?</h1>
        {status === 'failed' && !manual && <p className="lede">Não conseguimos acessar a sua localização.</p>}
        <form className="form" onSubmit={handleManual} noValidate ref={formRef}>
          <TextField
            label="Endereço ou bairro"
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={errors.text}
            list="neighborhoods"
            autoComplete="off"
          />
          <datalist id="neighborhoods">
            {NEIGHBORHOODS.map((item) => <option key={item.name} value={item.name} />)}
          </datalist>
          <button className="btn btn-primary" type="submit">Ver mapa</button>
        </form>
      </div>
    )
  }

  return (
    <div className="page page-narrow prompt">
      <span className="result-icon"><MapPin size={32} aria-hidden="true" /></span>
      <h1 className="page-title">Permitir localização?</h1>
      <p className="lede">Com a sua localização, mostramos os locais pet friendly mais perto de você.</p>
      <div className="form">
        <button className="btn btn-primary" type="button" onClick={request} disabled={status === 'loading'}>
          {status === 'loading' ? 'Localizando…' : 'Permitir localização'}
        </button>
        <button className="btn-link" type="button" onClick={() => setManual(true)}>Digitar endereço ou bairro</button>
      </div>
    </div>
  )
}

export function Places() {
  const { account, origin, setLocation } = useApp()
  const [params, setParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(null)

  const category = params.get('categoria') ?? ''
  const distance = params.get('distancia') ?? ''

  const nearby = useMemo(() => withDistance(PLACES, origin), [origin.lat, origin.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(
    () => filterPlaces(nearby, { category, maxKm: Number(distance) }),
    [nearby, category, distance],
  )

  if (!account.location) return <LocationPrompt />

  const setFilter = (key) => (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setSelectedId(null)
    setParams(next, { replace: true })
  }

  const selected = results.find((place) => place.id === selectedId)

  return (
    <div className="places">
      <div className="places-map">
        <MapView center={origin} pins={results} selectedId={selectedId} onSelect={setSelectedId} />
        {selected && (
          <div className="map-preview">
            <PlaceCard place={selected} />
          </div>
        )}
      </div>
      <div className="places-panel">
        <div className="places-head">
          <h1 className="page-title">Locais pet friendly</h1>
          <div className="location-bar">
            {origin.source === 'gps' ? <LocateFixed size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}
            <span>{origin.source === 'gps' ? 'Perto de você' : `Perto de ${origin.label}`}</span>
            <button type="button" className="text-button" onClick={() => setLocation(null)}>Mudar</button>
          </div>
          {origin.outside && (
            <p className="field-hint">Você está longe de Aracaju, e os locais de demonstração ficam lá. Centralizamos o mapa na cidade.</p>
          )}
          <Chips label="Filtrar por categoria" options={CATEGORY_OPTIONS} value={category} onChange={setFilter('categoria')} />
          <Chips label="Filtrar por distância" options={DISTANCE_OPTIONS} value={distance} onChange={setFilter('distancia')} />
        </div>

        {results.length === 0 ? (
          <EmptyState icon={SearchX} title="Nenhum local com esses filtros">
            <p className="lede">Tente aumentar a distância ou escolher outra categoria.</p>
            <button type="button" className="btn btn-soft" onClick={() => setParams({}, { replace: true })}>Limpar filtros</button>
          </EmptyState>
        ) : (
          <>
            <p className="results-count" role="status">
              {results.length === 1 ? '1 local encontrado' : `${results.length} locais encontrados`}
            </p>
            <div className="card-list">
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} selected={place.id === selectedId} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PetFit({ place, pets }) {
  if (!place.species) {
    return (
      <div className="fit">
        <Info size={20} aria-hidden="true" />
        <p>
          <b>Confirme com o local antes de ir</b>
          Ainda não temos o horário, a estrutura e as regras para pets deste lugar.
        </p>
      </div>
    )
  }
  if (!pets.length) {
    return (
      <div className="fit">
        <PawPrint size={20} aria-hidden="true" />
        <p>
          <b>Este local atende o seu pet?</b>
          <Link to="/perfil/pets/novo">Cadastre o seu pet</Link> para a gente conferir.
        </p>
      </div>
    )
  }
  return pets.map((pet) => {
    const { ok, reason } = checkPetFit(place, pet)
    return (
      <div key={pet.id} className={`fit ${ok ? 'is-ok' : 'is-no'}`}>
        {ok ? <CheckCircle2 size={20} aria-hidden="true" /> : <AlertTriangle size={20} aria-hidden="true" />}
        <p>
          <b>{ok ? `Atende ${pet.name}` : `Não atende ${pet.name}`}</b>
          {reason}
        </p>
      </div>
    )
  })
}

export function PlaceDetail() {
  const { id } = useParams()
  const { account, db, origin, recordView } = useApp()
  const place = PLACES.find((item) => item.id === id)

  useEffect(() => {
    if (place) recordView(place.id, new Date().toISOString())
    // Registra uma vez por visita, sem depender da identidade de recordView.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id])

  if (!place) {
    return (
      <div className="page">
        <TopBar title="Local" fallback="/locais" />
        <EmptyState icon={SearchX} title="Local não encontrado">
          <Link className="btn btn-soft" to="/locais">Voltar para Locais</Link>
        </EmptyState>
      </div>
    )
  }

  const reviews = reviewsOf(place, 'place', db.reviews)
  const noneFits =
    Boolean(place.species) &&
    account.pets.length > 0 &&
    account.pets.every((pet) => !checkPetFit(place, pet).ok)
  // Local real vai pelo nome e endereço: o Google acha o ponto exato, mesmo com pino aproximado.
  const destination = place.example ? `${place.lat},${place.lng}` : `${place.name}, ${place.address}`
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`

  return (
    <div className="page detail">
      <TopBar title={place.name} fallback="/locais">
        <FavoriteButton kind="place" targetId={place.id} name={place.name} />
      </TopBar>

      <div className="detail-columns">
        <div className="detail-main">
          <div className="detail-hero">
            <CategoryTile category={place.category} size={72} />
            <div>
              <p className="card-meta">
                {categoryOf(place).singular} · {place.neighborhood} · {formatDistance(distanceKm(origin, place))}
              </p>
              <div className="card-row">
                <Rating target={place} kind="place" />
                <OpenStatus hours={place.hours} />
              </div>
            </div>
          </div>
          {place.about && <p>{place.about}</p>}
          {place.example && <p className="field-hint">Local de exemplo, criado para a demonstração.</p>}

          <PetFit place={place} pets={account.pets} />

          <ul className="facts">
            <li><MapPin size={18} aria-hidden="true" />{place.address}</li>
            {place.hours && <li><Clock size={18} aria-hidden="true" />{place.hours.label}</li>}
            {place.rules && <li><Info size={18} aria-hidden="true" />{place.rules}</li>}
          </ul>

          {place.structure && (
            <section aria-labelledby="structure">
              <h2 id="structure">Estrutura para pets</h2>
              <ul className="tags">{place.structure.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
        </div>

        <aside className="detail-side">
          <section aria-labelledby="reviews">
            <div className="section-head">
              <h2 id="reviews">Avaliações</h2>
              <Rating target={place} kind="place" />
            </div>
            <ReviewList reviews={reviews} />
          </section>
        </aside>
      </div>

      <div className="sticky-cta">
        <a className={`btn ${noneFits ? 'btn-soft' : 'btn-primary'}`} href={routeUrl} target="_blank" rel="noreferrer">
          <Navigation size={18} aria-hidden="true" />Abrir rota
        </a>
        <Link className={`btn ${noneFits ? 'btn-primary' : 'btn-soft'}`} to="/locais">
          <Compass size={18} aria-hidden="true" />Ver outros
        </Link>
      </div>
    </div>
  )
}
