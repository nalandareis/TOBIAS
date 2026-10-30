import { Camera, Image as ImageIcon, PawPrint } from 'lucide-react'
import { useRef, useState } from 'react'
import { fileToPhoto } from '../lib/image'
import { validatePet } from '../lib/validation'
import { SelectField, TextField, useFocusFirstError } from './ui'

const EMPTY_PET = { name: '', species: '', breed: '', age: '', size: '', photo: null }

export function PhotoField({ label, photo, onChange, icon: Icon = PawPrint }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [error, setError] = useState(null)

  async function handleFile(event) {
    const [file] = event.target.files
    event.target.value = ''
    if (!file) return
    try {
      setError(null)
      onChange(await fileToPhoto(file))
    } catch {
      setError('Não conseguimos abrir esse arquivo. Escolha uma imagem.')
    }
  }

  return (
    <div className="field" role="group" aria-label={label}>
      <p className="field-label">{label}</p>
      <div className="photo-picker">
        <span className="photo-preview">
          {photo ? <img src={photo} alt="Prévia da foto" /> : <Icon size={34} aria-hidden="true" />}
        </span>
        <div className="photo-actions">
          <button type="button" className="btn btn-soft" onClick={() => cameraRef.current.click()}>
            <Camera size={18} aria-hidden="true" />Câmera
          </button>
          <button type="button" className="btn btn-soft" onClick={() => galleryRef.current.click()}>
            <ImageIcon size={18} aria-hidden="true" />Galeria
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
        <input ref={galleryRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export function PetForm({ initial = EMPTY_PET, submitLabel, onSubmit }) {
  const [pet, setPet] = useState({ ...initial, age: String(initial.age) })
  const [errors, setErrors] = useState({})
  const formRef = useFocusFirstError(errors)

  const set = (field) => (event) => setPet({ ...pet, [field]: event.target.value })

  function handleSubmit(event) {
    event.preventDefault()
    const found = validatePet(pet)
    setErrors(found)
    if (Object.keys(found).length === 0) {
      onSubmit({ ...pet, name: pet.name.trim(), breed: pet.breed.trim(), age: Number(pet.age) })
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
      <PhotoField label="Foto do pet (opcional)" photo={pet.photo} onChange={(photo) => setPet({ ...pet, photo })} />
      <TextField label="Nome" value={pet.name} onChange={set('name')} error={errors.name} autoComplete="off" />
      <SelectField label="Espécie" value={pet.species} onChange={set('species')} error={errors.species}>
        <option value="">Selecione</option>
        <option value="cao">Cão</option>
        <option value="gato">Gato</option>
        <option value="outro">Outro</option>
      </SelectField>
      <TextField label="Raça" value={pet.breed} onChange={set('breed')} hint="Se não souber, deixe em branco." autoComplete="off" />
      <TextField label="Idade (anos)" value={pet.age} onChange={set('age')} error={errors.age} inputMode="numeric" autoComplete="off" />
      <SelectField
        label="Porte"
        value={pet.size}
        onChange={set('size')}
        hint="Usamos o porte para conferir se um local atende o seu pet."
      >
        <option value="">Não informar</option>
        <option value="pequeno">Pequeno</option>
        <option value="medio">Médio</option>
        <option value="grande">Grande</option>
      </SelectField>
      <button className="btn btn-primary" type="submit">{submitLabel}</button>
    </form>
  )
}
