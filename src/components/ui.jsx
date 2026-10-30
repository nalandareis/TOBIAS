import { ArrowLeft, Eye, EyeOff, Heart, Star } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatRating, initials, plural } from '../lib/format'
import { ratingSummary, reviewsOf } from '../lib/reviews'
import { isFavorite } from '../lib/db'
import { useApp } from '../lib/store'
import { useToast } from './Toast'

export function TopBar({ title, fallback = '/inicio', children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const goBack = () => (location.key === 'default' ? navigate(fallback) : navigate(-1))
  return (
    <header className="topbar">
      <button type="button" className="icon-button" onClick={goBack} aria-label="Voltar">
        <ArrowLeft size={22} />
      </button>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">{children}</div>
    </header>
  )
}

export function Field({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy })}
      {hint && !error && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export function TextField({ label, error, hint, ...input }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(fieldProps) => <input className="input" {...fieldProps} {...input} />}
    </Field>
  )
}

export function SelectField({ label, error, hint, children, ...select }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(fieldProps) => (
        <select className="input" {...fieldProps} {...select}>
          {children}
        </select>
      )}
    </Field>
  )
}

export function PasswordField({ label, error, hint, ...input }) {
  const [visible, setVisible] = useState(false)
  return (
    <Field label={label} error={error} hint={hint}>
      {(fieldProps) => (
        <div className="password">
          <input className="input" type={visible ? 'text' : 'password'} {...fieldProps} {...input} />
          <button
            type="button"
            className="icon-button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      )}
    </Field>
  )
}

// Leva o foco ao primeiro campo com erro depois de uma tentativa de envio.
export function useFocusFirstError(errors) {
  const formRef = useRef(null)
  useEffect(() => {
    if (Object.keys(errors).length) formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [errors])
  return formRef
}

export function Avatar({ name, photo, size = 56 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 }
  if (photo) return <img className="avatar" style={style} src={photo} alt="" />
  return <span className="avatar avatar-initials" style={style} aria-hidden="true">{initials(name)}</span>
}

export function Rating({ target, kind }) {
  const { db } = useApp()
  const { average, count } = ratingSummary(reviewsOf(target, kind, db.reviews))
  if (!count) return <span className="rating">Sem avaliações</span>
  return (
    <span className="rating" aria-label={`Nota ${formatRating(average)} de 5, ${plural(count, 'avaliação', 'avaliações')}`}>
      <Star size={15} fill="currentColor" aria-hidden="true" />
      <b>{formatRating(average)}</b>
      <span>({count})</span>
    </span>
  )
}

export function FavoriteButton({ kind, targetId, name }) {
  const { account, toggleFavorite } = useApp()
  const toast = useToast()
  const active = isFavorite(account, kind, targetId)

  function handleClick(event) {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(kind, targetId)
    toast(active ? 'Removido da lista' : 'Salvo nos Favoritos', { to: '/favoritos', action: 'Abrir lista' })
  }

  return (
    <button
      type="button"
      className={`icon-button favorite${active ? ' is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Remover ${name} dos favoritos` : `Salvar ${name} nos favoritos`}
      onClick={handleClick}
    >
      <Heart size={22} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}

export function Chips({ label, options, value, onChange }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip${value === option.value ? ' is-active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Tabs({ label, options, value, onChange }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`tab${value === option.value ? ' is-active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function ReviewList({ reviews }) {
  if (!reviews.length) return <p className="lede">Ainda sem avaliações. Depois de visitar, avalie pelo Histórico.</p>
  return (
    <ul className="review-list">
      {reviews.map((review, index) => (
        <li key={`${review.author}-${index}`}>
          <div className="review-head">
            <b>{review.author}</b>
            <span className="rating">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              <b>{review.rating}</b>
            </span>
          </div>
          {review.comment && <p>{review.comment}</p>}
        </li>
      ))}
    </ul>
  )
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon size={26} aria-hidden="true" /></span>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
