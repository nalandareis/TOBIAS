import { Camera, PawPrint, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ListLink } from '../components/Cards'
import { PetForm, PhotoField } from '../components/PetForm'
import { useToast } from '../components/Toast'
import { SelectField, TextField, TopBar, useFocusFirstError } from '../components/ui'
import { findAccount } from '../lib/db'
import { useApp } from '../lib/store'
import { validateProfile } from '../lib/validation'

export function Settings() {
  return (
    <div className="page page-narrow">
      <TopBar title="Configurações" fallback="/perfil" />
      <nav className="list-links" aria-label="O que alterar">
        <ListLink to="/configuracoes/dados" icon={UserRound} title="Dados pessoais" detail="Nome, e-mail e cidade" />
        <ListLink to="/configuracoes/foto" icon={Camera} title="Foto de perfil" />
        <ListLink to="/configuracoes/pet" icon={PawPrint} title="Dados do pet" detail="Nome, raça, idade e foto" />
      </nav>
    </div>
  )
}

export function SettingsProfile() {
  const { account, db, updateProfile } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [fields, setFields] = useState({ name: account.name, email: account.email, city: account.city })
  const [errors, setErrors] = useState({})
  const formRef = useFocusFirstError(errors)

  const set = (field) => (event) => setFields({ ...fields, [field]: event.target.value })

  function handleSubmit(event) {
    event.preventDefault()
    const found = validateProfile(fields)
    const owner = findAccount(db, fields.email)
    if (owner && owner.id !== account.id) found.email = 'Este e-mail já é usado por outra conta.'
    setErrors(found)
    if (Object.keys(found).length) return
    updateProfile(fields)
    toast('Alterações salvas')
    navigate('/configuracoes', { replace: true })
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Dados pessoais" fallback="/configuracoes" />
      <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
        <TextField label="Nome" value={fields.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <TextField label="E-mail" type="email" value={fields.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        <TextField label="Cidade" value={fields.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
        <button className="btn btn-primary" type="submit">Salvar alterações</button>
      </form>
    </div>
  )
}

export function SettingsPhoto() {
  const { account, updatePhoto } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [photo, setPhoto] = useState(account.photo)

  function handleSave() {
    updatePhoto(photo)
    toast('Alterações salvas')
    navigate('/configuracoes', { replace: true })
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Foto de perfil" fallback="/configuracoes" />
      <div className="form">
        <PhotoField label="Sua foto" photo={photo} icon={UserRound} onChange={setPhoto} />
        <button className="btn btn-primary" type="button" onClick={handleSave}>Salvar alterações</button>
      </div>
    </div>
  )
}

export function SettingsPet() {
  const { account, updatePet } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [petId, setPetId] = useState(account.pets[0]?.id ?? '')
  const pet = account.pets.find((item) => item.id === petId)

  function handleSubmit(changes) {
    updatePet({ ...pet, ...changes })
    toast('Alterações salvas')
    navigate('/configuracoes', { replace: true })
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Dados do pet" fallback="/configuracoes" />
      {!pet ? (
        <div className="notice">
          <p>Você ainda não cadastrou um pet.</p>
          <Link className="btn btn-soft" to="/perfil/pets/novo?volta=/configuracoes">Cadastrar pet</Link>
        </div>
      ) : (
        <>
          {account.pets.length > 1 && (
            <SelectField label="Qual pet?" value={petId} onChange={(event) => setPetId(event.target.value)}>
              {account.pets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </SelectField>
          )}
          <PetForm key={pet.id} initial={pet} submitLabel="Salvar alterações" onSubmit={handleSubmit} />
        </>
      )}
    </div>
  )
}
