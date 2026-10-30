import { CalendarCheck, CalendarX2, Dog, Footprints, Home as HomeIcon, MessageCircle, Send, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CaregiverCard } from '../components/Cards'
import { Avatar, Chips, EmptyState, FavoriteButton, Rating, ReviewList, SelectField, TextField, TopBar, useFocusFirstError } from '../components/ui'
import { CAREGIVERS, SERVICES } from '../data/caregivers'
import { NEIGHBORHOODS } from '../data/city'
import { daysOffLabel, decideRequest, filterCaregivers, offersService, totalPrice } from '../lib/care'
import { chatKey, newId } from '../lib/db'
import { firstName, formatMoney, formatPeriod, toDayInput } from '../lib/format'
import { reviewsOf } from '../lib/reviews'
import { useApp } from '../lib/store'
import { validatePeriod, validateRequest } from '../lib/validation'

const SERVICE_ICONS = { baba: HomeIcon, hospedagem: Dog, passeio: Footprints }
const SERVICE_OPTIONS = SERVICES.map((service) => ({ value: service.id, label: service.label }))
const REPLY_DELAY_MS = 1200
const RESPONSE_DELAY_MS = 1600

const serviceById = (id) => SERVICES.find((service) => service.id === id)
const findCaregiver = (id) => CAREGIVERS.find((item) => item.id === id)

function NotFound() {
  return (
    <div className="page">
      <TopBar title="Cuidador" fallback="/cuidadores" />
      <EmptyState icon={Users} title="Cuidador não encontrado">
        <Link className="btn btn-soft" to="/cuidadores">Voltar para Cuidadores</Link>
      </EmptyState>
    </div>
  )
}

function ServiceChoice() {
  return (
    <div className="page page-narrow">
      <h1 className="page-title">Do que o seu pet precisa?</h1>
      <p className="lede">Escolha o serviço para ver quem atende na sua região.</p>
      <div className="service-list">
        {SERVICES.map((service) => {
          const Icon = SERVICE_ICONS[service.id]
          return (
            <Link key={service.id} className="service-option" to={`/cuidadores?servico=${service.id}`}>
              <span className="list-link-icon"><Icon size={24} aria-hidden="true" /></span>
              <span>
                <b>{service.label}</b>
                <small>{service.description}</small>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Caregivers() {
  const [params, setParams] = useSearchParams()
  const service = params.get('servico')
  const neighborhood = params.get('bairro') ?? ''
  const start = params.get('inicio') ?? ''
  const end = params.get('fim') ?? ''

  if (!service) return <ServiceChoice />

  const today = toDayInput()
  const errors = validatePeriod({ start, end }, today)
  const hasErrors = Object.keys(errors).length > 0
  const results = hasErrors ? [] : filterCaregivers(CAREGIVERS, { service, neighborhood, start, end })

  const setFilter = (key) => (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function clearFilters() {
    setParams({ servico: service }, { replace: true })
  }

  return (
    <div className="page">
      <h1 className="page-title">Cuidadores</h1>
      <Chips label="Serviço" options={SERVICE_OPTIONS} value={service} onChange={setFilter('servico')} />
      <div className="filters">
        <SelectField label="Bairro" value={neighborhood} onChange={(event) => setFilter('bairro')(event.target.value)}>
          <option value="">Todos os bairros</option>
          {NEIGHBORHOODS.map((item) => <option key={item.name}>{item.name}</option>)}
        </SelectField>
        <TextField label="Início" type="date" min={today} value={start} error={errors.start} onChange={(event) => setFilter('inicio')(event.target.value)} />
        <TextField label="Fim" type="date" min={start || today} value={end} error={errors.end} onChange={(event) => setFilter('fim')(event.target.value)} />
      </div>

      {results.length === 0 ? (
        <EmptyState icon={CalendarX2} title="Nenhum cuidador disponível">
          <p className="lede">Tente outro bairro ou outras datas.</p>
          <button type="button" className="btn btn-soft" onClick={clearFilters}>Limpar filtros</button>
        </EmptyState>
      ) : (
        <>
          <p className="results-count" role="status">
            {results.length === 1 ? '1 cuidador disponível' : `${results.length} cuidadores disponíveis`}
          </p>
          <div className="card-grid">
            {results.map((caregiver) => (
              <CaregiverCard key={caregiver.id} caregiver={caregiver} search={`?${params.toString()}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function CaregiverDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { db } = useApp()
  const caregiver = findCaregiver(id)

  if (!caregiver) return <NotFound />

  const search = params.toString() ? `?${params.toString()}` : ''
  const reviews = reviewsOf(caregiver, 'caregiver', db.reviews)

  return (
    <div className="page detail">
      <TopBar title={caregiver.name} fallback="/cuidadores">
        <FavoriteButton kind="caregiver" targetId={caregiver.id} name={caregiver.name} />
      </TopBar>

      <div className="detail-columns">
        <div className="detail-main">
          <div className="detail-hero">
            <Avatar name={caregiver.name} size={84} />
            <div>
              <p className="card-meta">{caregiver.neighborhood}</p>
              <Rating target={caregiver} kind="caregiver" />
              <p className="card-meta">{caregiver.responseTime}</p>
            </div>
          </div>

          <dl className="stats">
            <div><dt>Experiência</dt><dd>{caregiver.yearsExperience} anos</dd></div>
            <div><dt>Atendimentos</dt><dd>{caregiver.clients}</dd></div>
          </dl>

          <p>{caregiver.bio}</p>

          <ul className="trust">
            {caregiver.verified.map((item) => (
              <li key={item}><ShieldCheck size={18} aria-hidden="true" />{item}</li>
            ))}
          </ul>

          <section aria-labelledby="services">
            <h2 id="services">Serviços e preços</h2>
            <ul className="price-list">
              {caregiver.services.map((item) => {
                const service = serviceById(item.id)
                return (
                  <li key={item.id}>
                    <span><b>{service.label}</b><small>{service.description}</small></span>
                    <b>{formatMoney(item.price)}<small> / {service.unit}</small></b>
                  </li>
                )
              })}
            </ul>
            <p className="field-hint">{daysOffLabel(caregiver)}</p>
          </section>
        </div>

        <aside className="detail-side">
          <section aria-labelledby="reviews">
            <div className="section-head">
              <h2 id="reviews">Avaliações</h2>
              <Rating target={caregiver} kind="caregiver" />
            </div>
            <ReviewList reviews={reviews} />
          </section>
        </aside>
      </div>

      <div className="sticky-cta">
        <Link className="btn btn-primary" to={`/cuidadores/${caregiver.id}/solicitar${search}`}>Solicitar</Link>
        <Link className="btn btn-soft" to={`/cuidadores/${caregiver.id}/conversa${search}`}>
          <MessageCircle size={18} aria-hidden="true" />Conversar
        </Link>
      </div>
    </div>
  )
}

export function RequestService() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { account, addRequest, recordContact } = useApp()
  const navigate = useNavigate()
  const caregiver = findCaregiver(id)
  const today = toDayInput()

  const preferred = params.get('servico')
  const [form, setForm] = useState({
    service: caregiver && offersService(caregiver, preferred) ? preferred : caregiver?.services[0].id,
    start: params.get('inicio') ?? '',
    end: params.get('fim') ?? '',
    petId: params.get('pet') ?? account.pets[0]?.id ?? '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [waiting, setWaiting] = useState(false)
  const timer = useRef(null)
  const formRef = useFocusFirstError(errors)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!caregiver) return <NotFound />

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  const total = form.start ? totalPrice(caregiver, form.service, form.start, form.end) : 0
  const backHere = encodeURIComponent(`/cuidadores/${caregiver.id}/solicitar?${params.toString()}`)

  function handleSubmit(event) {
    event.preventDefault()
    const found = validateRequest(form, today)
    setErrors(found)
    if (Object.keys(found).length) return

    setWaiting(true)
    const at = new Date().toISOString()
    const request = {
      id: newId(),
      userId: account.id,
      caregiverId: caregiver.id,
      ...form,
      end: form.end || form.start,
      total,
      status: decideRequest(caregiver, form.start, form.end),
      at,
    }
    timer.current = setTimeout(() => {
      addRequest(request)
      recordContact(caregiver.id, at)
      navigate(`/solicitacoes/${request.id}`, { replace: true })
    }, RESPONSE_DELAY_MS)
  }

  if (waiting) {
    return (
      <div className="page page-narrow prompt">
        <div className="splash-dots" aria-hidden="true"><i /><i /><i /><i /></div>
        <h1 className="page-title" role="status">Aguardando resposta de {firstName(caregiver.name)}…</h1>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Solicitar serviço" fallback={`/cuidadores/${caregiver.id}`} />
      <div className="request-for">
        <Avatar name={caregiver.name} size={44} />
        <p><b>{caregiver.name}</b><small>{caregiver.neighborhood}</small></p>
      </div>
      <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
        <SelectField label="Serviço" value={form.service} onChange={set('service')} error={errors.service}>
          {caregiver.services.map((item) => (
            <option key={item.id} value={item.id}>
              {serviceById(item.id).label} ({formatMoney(item.price)} / {serviceById(item.id).unit})
            </option>
          ))}
        </SelectField>
        <div className="form-row">
          <TextField label="Início" type="date" min={today} value={form.start} onChange={set('start')} error={errors.start} />
          <TextField label="Fim" type="date" min={form.start || today} value={form.end} onChange={set('end')} error={errors.end} />
        </div>
        {account.pets.length > 0 ? (
          <SelectField label="Pet" value={form.petId} onChange={set('petId')} error={errors.petId}>
            {account.pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
          </SelectField>
        ) : (
          <div className="notice" role="alert">
            <p>Cadastre o seu pet para enviar o pedido.</p>
            <Link className="btn btn-soft" to={`/perfil/pets/novo?volta=${backHere}`}>Cadastrar pet</Link>
          </div>
        )}
        <div className="field">
          <label htmlFor="request-notes">Observações (opcional)</label>
          <textarea id="request-notes" className="input" rows="3" value={form.notes} onChange={set('notes')} />
        </div>
        {total > 0 && (
          <p className="total"><span>Total estimado</span><b>{formatMoney(total)}</b></p>
        )}
        <button className="btn btn-primary" type="submit" disabled={account.pets.length === 0}>Enviar solicitação</button>
      </form>
    </div>
  )
}

export function RequestResult() {
  const { id } = useParams()
  const { db, account } = useApp()
  const request = db.requests.find((item) => item.id === id && item.userId === account.id)
  const caregiver = request && findCaregiver(request.caregiverId)

  if (!caregiver) return <NotFound />

  const service = serviceById(request.service)
  const pet = account.pets.find((item) => item.id === request.petId)
  const name = firstName(caregiver.name)

  if (request.status === 'recusado') {
    const suggestions = CAREGIVERS.filter(
      (item) => item.id !== caregiver.id && !item.alwaysDeclines && offersService(item, request.service),
    )
    return (
      <div className="page page-narrow">
        <TopBar title="Solicitação" fallback="/cuidadores" />
        <div className="result">
          <span className="result-icon is-warning"><CalendarX2 size={34} aria-hidden="true" /></span>
          <h1>{name} não pode atender</h1>
          <p className="lede">A agenda está cheia nessas datas. Nenhum valor foi cobrado.</p>
        </div>
        <section aria-labelledby="suggestions">
          <h2 id="suggestions">Outras opções de {service.label.toLowerCase()}</h2>
          <div className="card-grid">
            {suggestions.map((item) => (
              <CaregiverCard
                key={item.id}
                caregiver={item}
                search={`?servico=${request.service}&inicio=${request.start}&fim=${request.end}`}
              />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Solicitação" fallback="/historico?aba=servicos" />
      <div className="result">
        <span className="result-icon is-success"><CalendarCheck size={34} aria-hidden="true" /></span>
        <h1>Serviço confirmado</h1>
        <p className="lede">{name} aceitou o seu pedido. O pagamento é combinado diretamente com quem cuida.</p>
      </div>
      <dl className="summary">
        <div><dt>Serviço</dt><dd>{service.label}</dd></div>
        <div><dt>Período</dt><dd>{formatPeriod(request.start, request.end)}</dd></div>
        {pet && <div><dt>Pet</dt><dd>{pet.name}</dd></div>}
        <div><dt>Total estimado</dt><dd>{formatMoney(request.total)}</dd></div>
      </dl>
      <div className="form">
        <Link className="btn btn-primary" to={`/cuidadores/${caregiver.id}/conversa`}>Conversar com {name}</Link>
        <Link className="btn-link" to="/historico?aba=servicos">Ver no histórico</Link>
      </div>
    </div>
  )
}

export function Chat() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { account, db, addChatMessage, recordContact } = useApp()
  const caregiver = findCaregiver(id)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const timer = useRef(null)

  const key = chatKey(account.id, id)
  const messages = db.chats[key] ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length, typing])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!caregiver) return <NotFound />

  const name = firstName(caregiver.name)
  const search = params.toString() ? `?${params.toString()}` : ''

  function handleSubmit(event) {
    event.preventDefault()
    const content = text.trim()
    if (!content) return
    const at = new Date().toISOString()
    addChatMessage(key, { id: newId(), from: 'me', text: content, at })
    recordContact(caregiver.id, at)
    setText('')
    setTyping(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setTyping(false)
      addChatMessage(key, {
        id: newId(),
        from: 'them',
        text: `Oi, ${firstName(account.name)}! Aqui é ${name}. Pode me contar a rotina do seu pet e as datas que você precisa?`,
        at: new Date().toISOString(),
      })
    }, REPLY_DELAY_MS)
  }

  return (
    <div className="chat">
      <TopBar title={caregiver.name} fallback={`/cuidadores/${caregiver.id}`}>
        <Link className="btn btn-soft btn-small" to={`/cuidadores/${caregiver.id}/solicitar${search}`}>Solicitar</Link>
      </TopBar>
      <div className="chat-log" aria-live="polite">
        <p className="chat-note">Conversa de demonstração: as respostas são simuladas.</p>
        {messages.map((message) => (
          <p key={message.id} className={`bubble ${message.from === 'me' ? 'is-me' : ''}`}>{message.text}</p>
        ))}
        {typing && <p className="bubble is-typing">{name} está escrevendo…</p>}
        <div ref={endRef} />
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          className="input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escreva uma mensagem"
          aria-label="Mensagem"
        />
        <button className="btn btn-primary" type="submit" aria-label="Enviar mensagem"><Send size={18} aria-hidden="true" /></button>
      </form>
    </div>
  )
}
