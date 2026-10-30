import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as data from './db'
import { resolveOrigin } from './geo'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [db, setDb] = useState(data.loadDb)

  useEffect(() => data.saveDb(db), [db])

  const account = db.accounts.find((item) => item.id === db.sessionId) ?? null
  const accountId = account?.id

  const value = useMemo(() => {
    const onAccount = (change) => (...args) => setDb((current) => change(current, accountId, ...args))
    return {
      db,
      account,
      origin: resolveOrigin(account),
      register: (fields) => setDb((current) => data.register(current, fields)),
      signIn: (id) => setDb((current) => data.signIn(current, id)),
      signOut: () => setDb(data.signOut),
      changePasswordFor: (id, password) => setDb((current) => data.changePassword(current, id, password)),
      updateProfile: onAccount(data.updateProfile),
      updatePhoto: onAccount(data.updatePhoto),
      setLocation: onAccount(data.setLocation),
      addPet: onAccount(data.addPet),
      updatePet: onAccount(data.updatePet),
      toggleFavorite: onAccount(data.toggleFavorite),
      recordView: onAccount(data.recordView),
      recordContact: onAccount(data.recordContact),
      addRequest: (request) => setDb((current) => data.addRequest(current, request)),
      saveReview: (review) => setDb((current) => data.saveReview(current, review)),
      addChatMessage: (key, message) => setDb((current) => data.addChatMessage(current, key, message)),
    }
  }, [db, account, accountId])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
