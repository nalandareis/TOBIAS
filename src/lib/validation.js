export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export const MIN_PASSWORD = 8

const check = (rules) =>
  Object.fromEntries(Object.entries(rules).filter(([, message]) => Boolean(message)))

const nameError = (name) => (name.trim().length < 2 ? 'Digite o seu nome.' : null)
const emailError = (email) => (isEmail(email) ? null : 'Digite um e-mail válido, como voce@email.com.')

export function validateSignUp({ name, email, password }) {
  return check({
    name: nameError(name),
    email: emailError(email),
    password: password.length < MIN_PASSWORD ? `Use pelo menos ${MIN_PASSWORD} caracteres.` : null,
  })
}

export function validateNewPassword({ password, confirm }) {
  return check({
    password: password.length < MIN_PASSWORD ? `Use pelo menos ${MIN_PASSWORD} caracteres.` : null,
    confirm: password !== confirm ? 'As senhas não são iguais.' : null,
  })
}

export function validateProfile({ name, email, city }) {
  return check({
    name: nameError(name),
    email: emailError(email),
    city: city.trim().length < 2 ? 'Digite a sua cidade.' : null,
  })
}

export function validatePet({ name, species, age }) {
  const years = Number(age)
  return check({
    name: name.trim() ? null : 'Digite o nome do pet.',
    species: species ? null : 'Escolha a espécie.',
    age: age === '' || !Number.isInteger(years) || years < 0 || years > 40
      ? 'Digite a idade em anos, de 0 a 40.'
      : null,
  })
}

export function validatePeriod({ start, end }, today) {
  return check({
    start: start && start < today ? 'Escolha uma data a partir de hoje.' : null,
    end: start && end && end < start ? 'A data final vem antes do início.' : null,
  })
}

export function validateRequest({ service, start, end, petId }, today) {
  return check({
    service: service ? null : 'Escolha um serviço.',
    start: !start ? 'Escolha a data de início.' : validatePeriod({ start, end }, today).start,
    end: validatePeriod({ start, end }, today).end,
    petId: petId ? null : 'Escolha o pet.',
  })
}
