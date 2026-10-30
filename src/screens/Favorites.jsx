import { Heart } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { CaregiverCard, PlaceCard } from '../components/Cards'
import { EmptyState, Tabs } from '../components/ui'
import { CAREGIVERS } from '../data/caregivers'
import { PLACES } from '../data/places'
import { withDistance } from '../lib/places'
import { useApp } from '../lib/store'

export default function Favorites() {
  const { account, origin } = useApp()
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') ?? 'locais'

  const places = withDistance(PLACES.filter((item) => account.favorites.place.includes(item.id)), origin)
  const caregivers = CAREGIVERS.filter((item) => account.favorites.caregiver.includes(item.id))

  return (
    <div className="page">
      <h1 className="page-title">Favoritos</h1>
      <Tabs
        label="Tipo de favorito"
        value={tab}
        onChange={(value) => setParams({ aba: value }, { replace: true })}
        options={[
          { value: 'locais', label: `Locais (${places.length})` },
          { value: 'cuidadores', label: `Cuidadores (${caregivers.length})` },
        ]}
      />

      {tab === 'locais' &&
        (places.length ? (
          <div className="card-grid">
            {places.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          <EmptyState icon={Heart} title="Nenhum local salvo ainda">
            <p className="lede">Toque no coração de um local para encontrar ele aqui depois.</p>
            <Link className="btn btn-soft" to="/locais">Explorar locais</Link>
          </EmptyState>
        ))}

      {tab === 'cuidadores' &&
        (caregivers.length ? (
          <div className="card-grid">
            {caregivers.map((caregiver) => <CaregiverCard key={caregiver.id} caregiver={caregiver} />)}
          </div>
        ) : (
          <EmptyState icon={Heart} title="Nenhum cuidador salvo ainda">
            <p className="lede">Toque no coração de um perfil para encontrar aqui depois.</p>
            <Link className="btn btn-soft" to="/cuidadores">Ver cuidadores</Link>
          </EmptyState>
        ))}
    </div>
  )
}
