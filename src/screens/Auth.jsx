import { CheckCircle2, PartyPopper } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo, PawMark, PetsIllustration } from '../components/Brand'
import { CodeStep, generateCode } from '../components/CodeStep'
import { PasswordField, TextField, TopBar, useFocusFirstError } from '../components/ui'
import { checkPassword, DEMO_LOGIN, findAccount } from '../lib/db'
import { firstName } from '../lib/format'
import { useApp } from '../lib/store'
import { isEmail, validateNewPassword, validateSignUp } from '../lib/validation'

function AuthPage({ title, fallback, children }) {
  return (
    <div className="auth">
      <TopBar title={title} fallback={fallback} />
      <div className="auth-body">{children}</div>
    </div>
  )
}

export function Splash() {
  const { account } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate(account ? '/inicio' : '/bem-vindo', { replace: true }), 1800)
    return () => clearTimeout(timer)
  }, [account, navigate])

  return (
    <div className="splash">
      <PetsIllustration className="splash-pets" />
      <Logo className="splash-logo" />
      <div className="splash-dots" aria-label="Carregando" role="status">
        <i /><i /><i /><i />
      </div>
    </div>
  )
}

export function Welcome() {
  const { account } = useApp()
  if (account) return <Navigate to="/inicio" replace />
  return (
    <div className="welcome">
      <div className="welcome-brand">
        <PawMark size={124} className="paw-amber" />
        <h1>TOBIAS</h1>
      </div>
      <div className="welcome-actions">
        <Link className="btn btn-primary" to="/entrar">Entrar</Link>
        <Link className="btn-link" to="/criar-conta">Criar Conta</Link>
      </div>
    </div>
  )
}

export function Login() {
  const { db, account, signIn } = useApp()
  const { state } = useLocation()
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const formRef = useFocusFirstError(errors)

  if (account) return <Navigate to="/inicio" replace />

  function handleSubmit(event) {
    event.preventDefault()
    const found = findAccount(db, email)
    if (found && checkPassword(found, password)) signIn(found.id)
    else setErrors({ password: 'E-mail ou senha incorretos.' })
  }

  function fillDemo() {
    setEmail(DEMO_LOGIN.email)
    setPassword(DEMO_LOGIN.password)
    setErrors({})
  }

  return (
    <AuthPage title="Entrar" fallback="/bem-vindo">
      <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
        <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <PasswordField
          label="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        {errors.password && <p className="lede">Esqueceu a senha? Você pode criar uma nova abaixo.</p>}
        <button className="btn btn-primary" type="submit">Entrar</button>
        <Link className="btn-link" to="/esqueci-senha" state={{ email }}>Esqueci a senha</Link>
        <button type="button" className="demo-hint" onClick={fillDemo}>
          Apresentando o projeto? <u>Usar a conta de demonstração</u>
        </button>
      </form>
    </AuthPage>
  )
}

export function SignUp() {
  const { db, account, register } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState('form')
  const [fields, setFields] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [taken, setTaken] = useState(false)
  const [code, setCode] = useState('')
  const formRef = useFocusFirstError(errors)

  const set = (field) => (event) => {
    setFields({ ...fields, [field]: event.target.value })
    if (field === 'email') setTaken(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validateSignUp(fields)
    setErrors(found)
    if (Object.keys(found).length) return
    if (findAccount(db, fields.email)) {
      setTaken(true)
      return
    }
    setCode(generateCode())
    setStep('code')
  }

  function handleConfirm() {
    register(fields)
    setStep('created')
  }

  if (step === 'code') {
    return (
      <AuthPage title="Confirmar e-mail" fallback="/bem-vindo">
        <CodeStep email={fields.email} code={code} onResend={() => setCode(generateCode())} onConfirm={handleConfirm} />
      </AuthPage>
    )
  }

  if (step === 'created') {
    return (
      <div className="auth">
        <div className="auth-body result">
          <span className="result-icon is-success"><PartyPopper size={34} aria-hidden="true" /></span>
          <h1>Conta criada!</h1>
          <p className="lede">
            Que bom ter você aqui{account ? `, ${firstName(account.name)}` : ''}. Quer cadastrar o seu pet agora?
          </p>
          <div className="form">
            <Link className="btn btn-primary" to="/perfil/pets/novo?volta=/inicio" replace>Cadastrar pet</Link>
            <button className="btn-link" type="button" onClick={() => navigate('/inicio', { replace: true })}>
              Agora não
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthPage title="Criar conta" fallback="/bem-vindo">
      <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
        <TextField label="Nome" value={fields.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <TextField label="E-mail" type="email" value={fields.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        {taken && (
          <div className="notice" role="alert">
            <p>Este e-mail já tem uma conta no Tobias.</p>
            <Link className="btn btn-soft" to="/entrar" state={{ email: fields.email }}>Ir para o login</Link>
          </div>
        )}
        <PasswordField
          label="Senha"
          value={fields.password}
          onChange={set('password')}
          error={errors.password}
          hint="Use pelo menos 8 caracteres."
          autoComplete="new-password"
        />
        <button className="btn btn-primary" type="submit">Continuar</button>
      </form>
    </AuthPage>
  )
}

export function ForgotPassword() {
  const { db, signIn, changePasswordFor } = useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState(state?.email ?? '')
  const [code, setCode] = useState('')
  const [passwords, setPasswords] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const formRef = useFocusFirstError(errors)

  function handleEmail(event) {
    event.preventDefault()
    if (!isEmail(email)) setErrors({ email: 'Digite um e-mail válido, como voce@email.com.' })
    else if (!findAccount(db, email)) setErrors({ email: 'Não encontramos uma conta com esse e-mail.' })
    else {
      setErrors({})
      setCode(generateCode())
      setStep('code')
    }
  }

  function handlePassword(event) {
    event.preventDefault()
    const found = validateNewPassword(passwords)
    setErrors(found)
    if (Object.keys(found).length) return
    changePasswordFor(findAccount(db, email).id, passwords.password)
    setStep('done')
  }

  function enterApp() {
    signIn(findAccount(db, email).id)
    navigate('/inicio', { replace: true })
  }

  if (step === 'code') {
    return (
      <AuthPage title="Digite o código" fallback="/entrar">
        <CodeStep email={email} code={code} onResend={() => setCode(generateCode())} onConfirm={() => setStep('password')} />
      </AuthPage>
    )
  }

  if (step === 'password') {
    return (
      <AuthPage title="Nova senha" fallback="/entrar">
        <form className="form" onSubmit={handlePassword} noValidate ref={formRef}>
          <PasswordField
            label="Nova senha"
            value={passwords.password}
            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
            error={errors.password}
            hint="Use pelo menos 8 caracteres."
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirmar nova senha"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            error={errors.confirm}
            autoComplete="new-password"
          />
          <button className="btn btn-primary" type="submit">Salvar nova senha</button>
        </form>
      </AuthPage>
    )
  }

  if (step === 'done') {
    return (
      <div className="auth">
        <div className="auth-body result">
          <span className="result-icon is-success"><CheckCircle2 size={34} aria-hidden="true" /></span>
          <h1>Senha alterada</h1>
          <p className="lede">Pronto, a sua nova senha já vale.</p>
          <div className="form">
            <button className="btn btn-primary" type="button" onClick={enterApp}>Entrar no app</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthPage title="Esqueci a senha" fallback="/entrar">
      <form className="form" onSubmit={handleEmail} noValidate ref={formRef}>
        <p className="lede">Digite o e-mail da sua conta. Vamos enviar um código para criar uma senha nova.</p>
        <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
        <button className="btn btn-primary" type="submit">Enviar código</button>
      </form>
    </AuthPage>
  )
}
