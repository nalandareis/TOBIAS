import { describe, expect, it } from 'vitest'
import { CAREGIVERS } from '../data/caregivers'
import { PLACES } from '../data/places'
import { countDays, daysOffLabel, decideRequest, filterCaregivers, isAvailable, totalPrice } from './care'
import * as data from './db'
import { findNeighborhood, isInDemoArea, resolveOrigin } from './geo'
import { checkPetFit, filterPlaces, isOpenNow, withDistance } from './places'
import { ratingSummary, recommend, reviewsOf } from './reviews'
import { validatePet, validateRequest, validateSignUp } from './validation'

const byId = (list, id) => list.find((item) => item.id === id)
const dog = (size) => ({ species: 'cao', size })

describe('Criar conta e login', () => {
  it('recusa dados inválidos', () => {
    expect(Object.keys(validateSignUp({ name: 'A', email: 'x@', password: '123' }))).toEqual(['name', 'email', 'password'])
  })

  it('encontra e-mail já cadastrado sem diferenciar maiúsculas', () => {
    expect(data.findAccount(data.createSeed(), 'MARIANA@tobias.app')).not.toBeNull()
  })

  it('confere a senha e não guarda o texto original', () => {
    const db = data.createSeed()
    const account = data.findAccount(db, data.DEMO_LOGIN.email)
    expect(data.checkPassword(account, data.DEMO_LOGIN.password)).toBe(true)
    expect(data.checkPassword(account, 'errada')).toBe(false)
    expect(JSON.stringify(db)).not.toContain(data.DEMO_LOGIN.password)
  })

  it('troca a senha', () => {
    const db = data.changePassword(data.createSeed(), 'demo', 'NovaSenha1')
    expect(data.checkPassword(db.accounts[0], 'NovaSenha1')).toBe(true)
  })
})

describe('Pet', () => {
  it('exige nome, espécie e idade, mas aceita idade zero', () => {
    expect(Object.keys(validatePet({ name: '', species: '', age: '' }))).toEqual(['name', 'species', 'age'])
    expect(validatePet({ name: 'Luna', species: 'gato', age: '0' })).toEqual({})
  })
})

describe('Buscar locais', () => {
  const origin = { lat: -10.9447, lng: -37.0564 }

  it('filtra por categoria e distância, do mais perto para o mais longe', () => {
    const nearby = withDistance(PLACES, origin)
    const results = filterPlaces(nearby, { category: 'cafeteria', maxKm: 2 })
    expect(results.map((place) => place.id)).toEqual(['cafe-do-thor', 'grao-e-focinho'])
  })

  it('pode não encontrar nada', () => {
    expect(filterPlaces(withDistance(PLACES, origin), { category: 'hotel', maxKm: 1 })).toEqual([])
  })

  it('confere se o local atende o pet', () => {
    const cafe = byId(PLACES, 'grao-e-focinho') // só porte pequeno e médio
    expect(checkPetFit(cafe, dog('grande')).ok).toBe(false)
    expect(checkPetFit(cafe, dog('pequeno')).ok).toBe(true)
    expect(checkPetFit(cafe, dog('')).ok).toBe(true)
    expect(checkPetFit(byId(PLACES, 'bosque-das-patas'), { species: 'gato', size: '' }).ok).toBe(false)
  })

  it('sabe se o local está aberto', () => {
    const hours = { open: '11:00', close: '23:00', closedDays: [1] }
    expect(isOpenNow(hours, new Date(2026, 9, 27, 12, 0))).toBe(true) // terça
    expect(isOpenNow(hours, new Date(2026, 9, 27, 9, 0))).toBe(false)
    expect(isOpenNow(hours, new Date(2026, 9, 26, 12, 0))).toBe(false) // segunda
  })

  it('acha o bairro digitado, com ou sem acento', () => {
    expect(findNeighborhood('sao jose')?.name).toBe('São José')
    expect(findNeighborhood('Rua das Acácias, 120, Jardins')?.name).toBe('Jardins')
    expect(findNeighborhood('Copacabana')).toBeNull()
  })

  it('volta para Aracaju quando a pessoa está fora da região', () => {
    expect(isInDemoArea({ lat: -23.55, lng: -46.63 })).toBe(false)
    const origin = resolveOrigin({ location: { status: 'granted', outside: true } })
    expect(origin).toMatchObject({ source: 'city', outside: true })
  })
})

describe('Contratar cuidador', () => {
  const davi = byId(CAREGIVERS, 'davi-nunes') // não atende aos domingos

  it('conta os dias incluindo início e fim', () => {
    expect(countDays('2026-11-02', '2026-11-05')).toBe(4)
    expect(countDays('2026-11-02', '')).toBe(1)
  })

  it('confere a disponibilidade pelas datas', () => {
    expect(isAvailable(davi, '2026-11-02', '2026-11-03')).toBe(true) // segunda e terça
    expect(isAvailable(davi, '2026-11-07', '2026-11-08')).toBe(false) // inclui domingo
    expect(isAvailable(davi, '2026-11-02', '2026-11-30')).toBe(false)
  })

  it('filtra por serviço, bairro e datas', () => {
    const found = filterCaregivers(CAREGIVERS, { service: 'passeio', neighborhood: 'Jardins', start: '2026-11-02', end: '' })
    expect(found.map((item) => item.id)).toEqual(['davi-nunes'])
    expect(filterCaregivers(CAREGIVERS, { service: 'hospedagem', neighborhood: 'Centro' })).toEqual([])
  })

  it('calcula o total pelo número de dias', () => {
    expect(totalPrice(byId(CAREGIVERS, 'camila-santos'), 'hospedagem', '2026-11-02', '2026-11-05')).toBe(380)
  })

  it('aceita ou recusa o pedido', () => {
    expect(decideRequest(byId(CAREGIVERS, 'camila-santos'), '2026-11-02', '2026-11-05')).toBe('confirmado')
    expect(decideRequest(byId(CAREGIVERS, 'rita-moura'), '2026-11-02', '2026-11-05')).toBe('recusado')
    expect(decideRequest(davi, '2026-11-08', '')).toBe('recusado')
  })

  it('exige datas válidas e um pet', () => {
    const today = '2026-10-30'
    expect(Object.keys(validateRequest({ service: 'baba', start: '', end: '', petId: '' }, today))).toEqual(['start', 'petId'])
    expect(validateRequest({ service: 'baba', start: '2026-11-05', end: '2026-11-02', petId: 'a' }, today).end).toBeTruthy()
    expect(validateRequest({ service: 'baba', start: '2026-10-01', end: '', petId: 'a' }, today).start).toBeTruthy()
  })

  it('descreve os dias de folga', () => {
    expect(daysOffLabel(davi)).toBe('Não atende aos domingos.')
    expect(daysOffLabel(byId(CAREGIVERS, 'camila-santos'))).toBe('Atende todos os dias.')
  })
})

describe('Avaliações', () => {
  const place = byId(PLACES, 'cafe-do-thor') // notas 5, 5 e 4

  const review = (rating) => ({
    id: 'r1',
    userId: 'demo',
    authorName: 'Mariana C.',
    kind: 'place',
    targetId: place.id,
    rating,
    comment: '',
    at: '2026-10-30T12:00:00.000Z',
  })

  it('recalcula a nota média', () => {
    const db = data.saveReview(data.createSeed(), review(2))
    const summary = ratingSummary(reviewsOf(place, 'place', db.reviews))
    expect(summary).toEqual({ average: 4, count: 4 })
  })

  it('local sem avaliação não some das recomendações', () => {
    const unreviewed = { id: 'novo', reviews: [], distance: 1 }
    const ranked = recommend([{ id: 'fraco', reviews: [{ rating: 2 }], distance: 1 }, unreviewed], 'place', [])
    expect(ranked[0].id).toBe('novo')
    expect(ratingSummary([])).toEqual({ average: 0, count: 0 })
  })

  it('editar substitui a avaliação anterior', () => {
    const db = data.saveReview(data.saveReview(data.createSeed(), review(2)), review(5))
    expect(ratingSummary(reviewsOf(place, 'place', db.reviews)).count).toBe(4)
    expect(data.findReview(db, 'demo', 'place', place.id).rating).toBe(5)
  })
})

describe('Favoritos e histórico', () => {
  it('salva e remove favoritos', () => {
    let db = data.toggleFavorite(data.createSeed(), 'demo', 'place', 'terra-tupi')
    expect(data.isFavorite(db.accounts[0], 'place', 'terra-tupi')).toBe(true)
    db = data.toggleFavorite(db, 'demo', 'place', 'terra-tupi')
    expect(data.isFavorite(db.accounts[0], 'place', 'terra-tupi')).toBe(false)
  })

  it('não repete um local já visto', () => {
    const db = data.recordView(data.createSeed(), 'demo', 'lambida-gelato', '2026-10-30T12:00:00.000Z')
    expect(db.accounts[0].viewed.map((item) => item.id)).toEqual(['lambida-gelato', 'cafe-do-thor'])
  })
})

describe('Dados de exemplo', () => {
  it('não inventa informação sobre estabelecimentos reais', () => {
    const real = PLACES.filter((place) => !place.example)
    expect(real).toHaveLength(13)
    for (const place of real) {
      expect(place.reviews, place.name).toEqual([])
      expect(place.hours, place.name).toBeUndefined()
      expect(place.species, place.name).toBeUndefined()
      expect(place.structure, place.name).toBeUndefined()
    }
  })

  it('a conta de demonstração só cita locais que existem e não avalia locais reais', () => {
    const db = data.createSeed()
    for (const { id } of db.accounts[0].viewed) expect(byId(PLACES, id), id).toBeTruthy()
    for (const review of db.reviews) {
      expect(byId(PLACES, review.targetId).example, review.targetId).toBe(true)
    }
  })

  it('liga cada local e cuidador a um bairro conhecido', () => {
    for (const item of [...PLACES, ...CAREGIVERS]) {
      expect(findNeighborhood(item.neighborhood), item.name).not.toBeNull()
    }
  })
})
