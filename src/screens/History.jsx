import { History as HistoryIcon, MessageCircle, Repeat, Star } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { CategoryTile, categoryOf } from '../components/Cards'
import { Avatar, EmptyState, Tabs, TopBar } from '../components/ui'
import { CAREGIVERS, SERVICES } from '../data/caregivers'
import { PLACES } from '../data/places'
import { findReview } from '../lib/db'
import { formatDay, formatMoney, formatPeriod } from '../lib/format'
import { useApp } from '../lib/store'

const TABS = [
  { value: 'locais', label: 'Locais' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'contatos', label: 'Contatos' },
]

function ReviewLink({ kind, slug, id }) {
  const { db, account } = useApp()
  const reviewed = Boolean(findReview(db, account.id, kind, id))
  return (
    <Link className="btn btn-soft btn-small" to={`/avaliar/${slug}/${id}`}>
      <Star size={15} aria-hidden="true" />{reviewed ? 'Ver avaliação' : 'Avaliar'}
    </Link>
  )
}

function PlacesTab() {
  const { account } = useApp()
  if (!account.viewed.length) {
    return (
      <EmptyState icon={HistoryIcon} title="Nenhum local pesquisado">
        <Link className="btn btn-soft" to="/locais">Explorar locais</Link>
      </EmptyState>
    )
  }
  return (
    <ul className="history-list">
      {account.viewed.map(({ id, at }) => {
        const place = PLACES.find((item) => item.id === id)
        return (
          <li key={id} className="card history-item">
            <CategoryTile category={place.category} size={48} />
            <div className="card-body">
              <h3>{place.name}</h3>
              <p className="card-meta">{categoryOf(place).singular} · visto em {formatDay(at)}</p>
              <div className="history-actions">
                <Link className="btn btn-soft btn-small" to={`/locais/${id}`}>Ver detalhes</Link>
                <ReviewLink kind="place" slug="local" id={id} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ServicesTab() {
  const { account, db } = useApp()
  const requests = db.requests.filter((item) => item.userId === account.id && item.status === 'confirmado')
  if (!requests.length) {
    return (
      <EmptyState icon={HistoryIcon} title="Nenhum serviço contratado">
        <Link className="btn btn-soft" to="/cuidadores">Ver cuidadores</Link>
      </EmptyState>
    )
  }
  return (
    <ul className="history-list">
      {requests.map((request) => {
        const caregiver = CAREGIVERS.find((item) => item.id === request.caregiverId)
        const service = SERVICES.find((item) => item.id === request.service)
        return (
          <li key={request.id} className="card history-item">
            <Avatar name={caregiver.name} size={48} />
            <div className="card-body">
              <h3>{service.label} com {caregiver.name}</h3>
              <p className="card-meta">{formatPeriod(request.start, request.end)} · {formatMoney(request.total)}</p>
              <div className="history-actions">
                <Link className="btn btn-soft btn-small" to={`/solicitacoes/${request.id}`}>Ver detalhes</Link>
                <Link
                  className="btn btn-soft btn-small"
                  to={`/cuidadores/${caregiver.id}/solicitar?servico=${request.service}&pet=${request.petId}`}
                >
                  <Repeat size={15} aria-hidden="true" />Repetir
                </Link>
                <ReviewLink kind="caregiver" slug="cuidador" id={caregiver.id} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ContactsTab() {
  const { account } = useApp()
  if (!account.contacts.length) {
    return (
      <EmptyState icon={HistoryIcon} title="Nenhum cuidador contatado">
        <Link className="btn btn-soft" to="/cuidadores">Ver cuidadores</Link>
      </EmptyState>
    )
  }
  return (
    <ul className="history-list">
      {account.contacts.map(({ id, at }) => {
        const caregiver = CAREGIVERS.find((item) => item.id === id)
        return (
          <li key={id} className="card history-item">
            <Avatar name={caregiver.name} size={48} />
            <div className="card-body">
              <h3>{caregiver.name}</h3>
              <p className="card-meta">{caregiver.neighborhood} · contato em {formatDay(at)}</p>
              <div className="history-actions">
                <Link className="btn btn-soft btn-small" to={`/cuidadores/${id}`}>Ver detalhes</Link>
                <Link className="btn btn-soft btn-small" to={`/cuidadores/${id}/conversa`}>
                  <MessageCircle size={15} aria-hidden="true" />Conversar
                </Link>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function History() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') ?? 'locais'
  return (
    <div className="page page-narrow">
      <TopBar title="Histórico" fallback="/perfil" />
      <Tabs label="O que deseja ver?" options={TABS} value={tab} onChange={(value) => setParams({ aba: value }, { replace: true })} />
      {tab === 'locais' && <PlacesTab />}
      {tab === 'servicos' && <ServicesTab />}
      {tab === 'contatos' && <ContactsTab />}
    </div>
  )
}
