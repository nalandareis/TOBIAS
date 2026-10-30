import { sha256 } from 'js-sha256'
import { toDayInput } from './format'

// Protótipo sem servidor: os dados ficam no localStorage do navegador.
const STORAGE_KEY = 'tobias:db:v2'

export const DEMO_LOGIN = { email: 'mariana@tobias.app', password: 'Bento123' }

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const hashPassword = (salt, password) => sha256(`${salt}:${password}`)
const normalizeEmail = (email) => email.trim().toLowerCase()

function newAccount({ name, email, password }) {
  const salt = newId()
  return {
    id: newId(),
    name: name.trim(),
    email: normalizeEmail(email),
    salt,
    passwordHash: hashPassword(salt, password),
    city: 'Aracaju',
    photo: null,
    location: null,
    pets: [],
    favorites: { place: [], caregiver: [] },
    viewed: [],
    contacts: [],
  }
}

function daysAgo(now, days) {
  return new Date(now.getTime() - days * 86_400_000)
}

export function createSeed(now = new Date()) {
  const demo = {
    ...newAccount({ name: 'Mariana Costa', ...DEMO_LOGIN }),
    id: 'demo',
    pets: [{ id: 'bento', name: 'Bento', species: 'cao', breed: 'Golden retriever', age: 4, size: 'grande', photo: null }],
    favorites: { place: ['cafe-do-thor'], caregiver: ['camila-santos'] },
    viewed: [
      { id: 'cafe-do-thor', at: daysAgo(now, 3).toISOString() },
      { id: 'lambida-gelato', at: daysAgo(now, 9).toISOString() },
    ],
    contacts: [{ id: 'camila-santos', at: daysAgo(now, 24).toISOString() }],
  }
  return {
    sessionId: null,
    accounts: [demo],
    requests: [
      {
        id: 'demo-hospedagem',
        userId: 'demo',
        caregiverId: 'camila-santos',
        service: 'hospedagem',
        start: toDayInput(daysAgo(now, 20)),
        end: toDayInput(daysAgo(now, 17)),
        petId: 'bento',
        notes: '',
        total: 380,
        status: 'confirmado',
        at: daysAgo(now, 24).toISOString(),
      },
    ],
    reviews: [
      {
        id: 'demo-review',
        userId: 'demo',
        authorName: 'Mariana C.',
        kind: 'place',
        targetId: 'lambida-gelato',
        rating: 4,
        comment: 'Bento adorou o gelato.',
        at: daysAgo(now, 8).toISOString(),
      },
    ],
    chats: {},
  }
}

export function loadDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : createSeed()
  } catch {
    return createSeed()
  }
}

export function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Sem localStorage (janela privada ou cota cheia), o app segue só em memória.
  }
}

const updateAccount = (db, accountId, change) => ({
  ...db,
  accounts: db.accounts.map((account) =>
    account.id === accountId ? { ...account, ...change(account) } : account,
  ),
})

export const findAccount = (db, email) =>
  db.accounts.find((account) => account.email === normalizeEmail(email)) ?? null

export const checkPassword = (account, password) =>
  account.passwordHash === hashPassword(account.salt, password)

export function register(db, fields) {
  const account = newAccount(fields)
  return { ...db, accounts: [...db.accounts, account], sessionId: account.id }
}

export const signIn = (db, accountId) => ({ ...db, sessionId: accountId })
export const signOut = (db) => ({ ...db, sessionId: null })

export const changePassword = (db, accountId, password) =>
  updateAccount(db, accountId, (account) => ({
    passwordHash: hashPassword(account.salt, password),
  }))

export const updateProfile = (db, accountId, { name, email, city }) =>
  updateAccount(db, accountId, () => ({
    name: name.trim(),
    email: normalizeEmail(email),
    city: city.trim(),
  }))

export const updatePhoto = (db, accountId, photo) =>
  updateAccount(db, accountId, () => ({ photo }))

export const setLocation = (db, accountId, location) =>
  updateAccount(db, accountId, () => ({ location }))

export const addPet = (db, accountId, pet) =>
  updateAccount(db, accountId, (account) => ({ pets: [...account.pets, pet] }))

export const updatePet = (db, accountId, pet) =>
  updateAccount(db, accountId, (account) => ({
    pets: account.pets.map((item) => (item.id === pet.id ? pet : item)),
  }))

export const isFavorite = (account, kind, targetId) => account.favorites[kind].includes(targetId)

export const toggleFavorite = (db, accountId, kind, targetId) =>
  updateAccount(db, accountId, (account) => ({
    favorites: {
      ...account.favorites,
      [kind]: isFavorite(account, kind, targetId)
        ? account.favorites[kind].filter((id) => id !== targetId)
        : [...account.favorites[kind], targetId],
    },
  }))

// O item mais recente fica no topo, sem repetir.
const pushRecent = (list, id, at) => [{ id, at }, ...list.filter((item) => item.id !== id)]

export const recordView = (db, accountId, placeId, at) =>
  updateAccount(db, accountId, (account) => ({ viewed: pushRecent(account.viewed, placeId, at) }))

export const recordContact = (db, accountId, caregiverId, at) =>
  updateAccount(db, accountId, (account) => ({
    contacts: pushRecent(account.contacts, caregiverId, at),
  }))

export const addRequest = (db, request) => ({ ...db, requests: [request, ...db.requests] })

export function saveReview(db, review) {
  const others = db.reviews.filter(
    (item) =>
      !(item.userId === review.userId && item.kind === review.kind && item.targetId === review.targetId),
  )
  return { ...db, reviews: [review, ...others] }
}

export const findReview = (db, userId, kind, targetId) =>
  db.reviews.find(
    (item) => item.userId === userId && item.kind === kind && item.targetId === targetId,
  ) ?? null

export const chatKey = (userId, caregiverId) => `${userId}:${caregiverId}`

export const addChatMessage = (db, key, message) => ({
  ...db,
  chats: { ...db.chats, [key]: [...(db.chats[key] ?? []), message] },
})
