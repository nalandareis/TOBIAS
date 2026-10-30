import { CheckCircle2, MessageSquareText, SearchX, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, TopBar } from '../components/ui'
import { CAREGIVERS } from '../data/caregivers'
import { PLACES } from '../data/places'
import { findReview, newId } from '../lib/db'
import { formatRating, plural } from '../lib/format'
import { ratingSummary, reviewsOf } from '../lib/reviews'
import { useApp } from '../lib/store'

const TARGETS = {
  local: { kind: 'place', list: PLACES, slug: 'local' },
  cuidador: { kind: 'caregiver', list: CAREGIVERS, slug: 'cuidador' },
}

const authorLabel = (name) => {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
}

function StarInput({ value, onChange, error }) {
  return (
    <fieldset className={`stars${error ? ' has-error' : ''}`}>
      <legend>Sua nota</legend>
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className={star <= value ? 'is-on' : ''}>
            <input
              type="radio"
              name="rating"
              className="sr-only"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
            />
            <Star size={36} fill={star <= value ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className="sr-only">{plural(star, 'estrela', 'estrelas')}</span>
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  )
}

export function Review() {
  const { kind: slug, id } = useParams()
  const { account, db, saveReview } = useApp()
  const navigate = useNavigate()
  const config = TARGETS[slug]
  const target = config?.list.find((item) => item.id === id)
  const existing = target ? findReview(db, account.id, config.kind, id) : null

  const [step, setStep] = useState(existing ? 'existing' : 'form')
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [writing, setWriting] = useState(Boolean(existing?.comment))
  const [error, setError] = useState(null)

  if (!target) {
    return (
      <div className="page">
        <TopBar title="Avaliar" fallback="/historico" />
        <EmptyState icon={SearchX} title="Não encontramos o que avaliar">
          <Link className="btn btn-soft" to="/historico">Voltar para o histórico</Link>
        </EmptyState>
      </div>
    )
  }

  function submit() {
    if (!rating) {
      setError('Escolha uma nota de 1 a 5.')
      return
    }
    saveReview({
      id: existing?.id ?? newId(),
      userId: account.id,
      authorName: authorLabel(account.name),
      kind: config.kind,
      targetId: id,
      rating,
      comment: writing ? comment.trim() : '',
      at: new Date().toISOString(),
    })
    setStep('sent')
  }

  if (step === 'sent') {
    const { average, count } = ratingSummary(reviewsOf(target, config.kind, db.reviews))
    return (
      <div className="page page-narrow">
        <div className="result">
          <span className="result-icon is-success"><CheckCircle2 size={34} aria-hidden="true" /></span>
          <h1>Avaliação enviada</h1>
          <p className="lede">Obrigado por ajudar outros tutores.</p>
          <div className="big-rating">
            <Star size={26} fill="currentColor" aria-hidden="true" />
            <b>{formatRating(average)}</b>
            <span>nota média de {target.name}, com {plural(count, 'avaliação', 'avaliações')}</span>
          </div>
        </div>
        <div className="form">
          <Link className="btn btn-primary" to="/historico">Voltar para o histórico</Link>
        </div>
      </div>
    )
  }

  if (step === 'existing') {
    return (
      <div className="page page-narrow">
        <TopBar title="Sua avaliação" fallback="/historico" />
        <h2>{target.name}</h2>
        <div className="big-rating">
          <Star size={26} fill="currentColor" aria-hidden="true" />
          <b>{existing.rating}</b>
          <span>a sua nota</span>
        </div>
        {existing.comment && <blockquote className="quote">{existing.comment}</blockquote>}
        <div className="form">
          <button className="btn btn-primary" type="button" onClick={() => setStep('form')}>Editar avaliação</button>
          <button className="btn-link" type="button" onClick={() => navigate('/historico')}>Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Avaliar" fallback="/historico" />
      <h2>{target.name}</h2>
      <p className="lede">Como foi a sua experiência com este {slug === 'local' ? 'local' : 'serviço'}?</p>
      <div className="form">
        <StarInput
          value={rating}
          error={error}
          onChange={(value) => {
            setRating(value)
            setError(null)
          }}
        />
        {writing ? (
          <div className="field">
            <label htmlFor="review-comment">Comentário</label>
            <textarea
              id="review-comment"
              className="input"
              rows="4"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
        ) : (
          <button className="btn btn-soft" type="button" onClick={() => setWriting(true)}>
            <MessageSquareText size={18} aria-hidden="true" />Escrever comentário
          </button>
        )}
        <button className="btn btn-primary" type="button" onClick={submit}>Enviar avaliação</button>
      </div>
    </div>
  )
}

export function MyReviews() {
  const { account, db } = useApp()
  const mine = db.reviews.filter((review) => review.userId === account.id)
  return (
    <div className="page page-narrow">
      <TopBar title="Minhas avaliações" fallback="/perfil" />
      {mine.length === 0 ? (
        <EmptyState icon={Star} title="Nenhuma avaliação ainda">
          <p className="lede">Avalie locais e serviços a partir do seu histórico.</p>
          <Link className="btn btn-soft" to="/historico">Abrir histórico</Link>
        </EmptyState>
      ) : (
        <ul className="history-list">
          {mine.map((review) => {
            const slug = review.kind === 'place' ? 'local' : 'cuidador'
            const target = TARGETS[slug].list.find((item) => item.id === review.targetId)
            return (
              <li key={review.id} className="card history-item">
                <div className="card-body">
                  <h3>{target.name}</h3>
                  <p className="card-meta">Sua nota: {review.rating} de 5</p>
                  {review.comment && <p>{review.comment}</p>}
                  <div className="history-actions">
                    <Link className="btn btn-soft btn-small" to={`/avaliar/${slug}/${target.id}`}>Ver ou editar</Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
