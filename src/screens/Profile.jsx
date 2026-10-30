import { History, LogOut, MapPin, PawPrint, Plus, Settings, Star } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ListLink } from '../components/Cards'
import { Avatar, TopBar } from '../components/ui'
import { PetForm } from '../components/PetForm'
import { useToast } from '../components/Toast'
import { newId } from '../lib/db'
import { plural } from '../lib/format'
import { useApp } from '../lib/store'

const SPECIES = { cao: 'Cão', gato: 'Gato', outro: 'Outro' }

function PetCard({ pet }) {
  return (
    <li className="pet-card">
      {pet.photo ? (
        <img className="pet-photo" src={pet.photo} alt="" />
      ) : (
        <span className="pet-photo"><PawPrint size={26} aria-hidden="true" /></span>
      )}
      <div>
        <b>{pet.name}</b>
        <small>{[SPECIES[pet.species], pet.breed, plural(pet.age, 'ano', 'anos')].filter(Boolean).join(' · ')}</small>
      </div>
    </li>
  )
}

export function Profile() {
  const { account, signOut } = useApp()
  return (
    <div className="page page-narrow">
      <h1 className="sr-only">Perfil</h1>
      <div className="profile-head">
        <Avatar name={account.name} photo={account.photo} size={84} />
        <div>
          <h2>{account.name}</h2>
          <p className="card-meta">{account.email}</p>
          <p className="card-meta"><MapPin size={14} aria-hidden="true" /> {account.city}</p>
        </div>
      </div>

      <section aria-labelledby="my-pets">
        <div className="section-head">
          <h2 id="my-pets">Meus pets</h2>
          <Link className="text-button" to="/perfil/pets/novo"><Plus size={16} aria-hidden="true" />Adicionar pet</Link>
        </div>
        {account.pets.length ? (
          <ul className="pet-list">{account.pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}</ul>
        ) : (
          <Link className="notice notice-link" to="/perfil/pets/novo">
            <PawPrint size={20} aria-hidden="true" />
            Cadastre o seu pet para conferir quais locais atendem ele.
          </Link>
        )}
      </section>

      <nav className="list-links" aria-label="Sua conta">
        <ListLink to="/historico" icon={History} title="Histórico" detail="Locais, serviços e contatos" />
        <ListLink to="/perfil/avaliacoes" icon={Star} title="Minhas avaliações" detail="Consulte o que você já avaliou" />
        <ListLink to="/configuracoes" icon={Settings} title="Configurações" detail="Dados pessoais, foto e pet" />
      </nav>

      <button type="button" className="btn btn-soft" onClick={signOut}>
        <LogOut size={18} aria-hidden="true" />Sair
      </button>
      <p className="footnote">Protótipo acadêmico de UX/UI · Universidade Tiradentes. Restaurantes e hotéis para cães têm endereço real. Cafeterias, parques e cuidadores são fictícios. Os dados ficam só neste navegador.</p>
    </div>
  )
}

export function NewPet() {
  const { addPet } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const next = params.get('volta') ?? '/perfil'

  function handleSubmit(pet) {
    addPet({ ...pet, id: newId() })
    toast(`${pet.name} foi adicionado ao seu perfil`)
    navigate(next, { replace: true })
  }

  return (
    <div className="page page-narrow">
      <TopBar title="Adicionar pet" fallback={next} />
      <PetForm submitLabel="Salvar pet" onSubmit={handleSubmit} />
    </div>
  )
}
