import { Mail } from 'lucide-react'
import { useState } from 'react'
import { TextField, useFocusFirstError } from './ui'

export const generateCode = () => String(Math.floor(100000 + Math.random() * 900000))

// Sem servidor de e-mail, o código aparece aqui, no lugar da caixa de entrada.
export function CodeStep({ email, code, onResend, onConfirm }) {
  const [typed, setTyped] = useState('')
  const [errors, setErrors] = useState({})
  const [resent, setResent] = useState(false)
  const formRef = useFocusFirstError(errors)

  function handleSubmit(event) {
    event.preventDefault()
    if (typed.trim() === code) onConfirm()
    else setErrors({ code: 'Código incorreto. Confira ou peça um novo.' })
  }

  function handleResend() {
    onResend()
    setTyped('')
    setErrors({})
    setResent(true)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
      <p className="lede">Enviamos um código de 6 dígitos para <b>{email}</b>.</p>
      <div className="mail-preview">
        <Mail size={20} aria-hidden="true" />
        <p>
          <small>Simulação do e-mail</small>
          Seu código do Tobias é <b>{code}</b>
        </p>
      </div>
      <TextField
        label="Código"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        error={errors.code}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
      />
      <button className="btn btn-primary" type="submit">Confirmar código</button>
      <button className="btn-link" type="button" onClick={handleResend}>
        {resent ? 'Código reenviado. Enviar outro' : 'Não recebi o código'}
      </button>
    </form>
  )
}
