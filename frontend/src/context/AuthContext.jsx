import { useEffect, useState } from 'react'
import { getCurrentUser, registerAccount, signIn } from '../services/auth'
import { AuthContext } from './authContextValue'
const TOKEN_KEY = 'atelier-access-token'
const USER_KEY = 'atelier-user'

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem(TOKEN_KEY) ? readStoredUser() : null)
  const [isLoading, setIsLoading] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)))
  const [authNotice, setAuthNotice] = useState('')

  useEffect(() => {
    const clearExpiredSession = () => {
      setUser(null)
      setAuthNotice('Your session expired. Please sign in again.')
      setIsLoading(false)
    }

    window.addEventListener('atelier:session-expired', clearExpiredSession)

    if (!sessionStorage.getItem(TOKEN_KEY)) {
      return () => window.removeEventListener('atelier:session-expired', clearExpiredSession)
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      })
      .catch((error) => {
        if (error.response?.status !== 401) {
          setAuthNotice('Could not verify your session. Check that the backend is available, then try again.')
        }
      })
      .finally(() => setIsLoading(false))

    return () => window.removeEventListener('atelier:session-expired', clearExpiredSession)
  }, [])

  const saveSession = ({ token, user: authenticatedUser }) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
    setAuthNotice('')
    setIsLoading(false)
  }

  const createAccount = async (details) => saveSession(await registerAccount(details))
  const login = async (credentials) => saveSession(await signIn(credentials))
  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
    setAuthNotice('')
  }

  return <AuthContext.Provider value={{ user, isLoading, authNotice, setAuthNotice, createAccount, login, logout }}>{children}</AuthContext.Provider>
}