import { useEffect, useState } from 'react'
import { getCurrentUser, registerAccount, signIn, signOut } from '../services/auth'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authNotice, setAuthNotice] = useState('')

  useEffect(() => {
    const clearExpiredSession = () => {
      setUser(null)
      setAuthNotice('Your session expired. Please sign in again.')
      setIsLoading(false)
    }

    window.addEventListener('atelier:session-expired', clearExpiredSession)

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
      })
      .catch((error) => {
        if (error.response?.status !== 401) {
          setAuthNotice('Could not verify your session. Check that the backend is available, then try again.')
        }
      })
      .finally(() => setIsLoading(false))

    return () => window.removeEventListener('atelier:session-expired', clearExpiredSession)
  }, [])

  const login = async (credentials) => {
    const authenticatedUser = await signIn(credentials)
    setUser(authenticatedUser)
    setAuthNotice('')
    setIsLoading(false)
    return authenticatedUser
  }

  const createAccount = async (details) => registerAccount(details)
  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setAuthNotice('')
    } catch {
      setAuthNotice('Could not sign out right now. Please try again when the account service is available.')
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, authNotice, setAuthNotice, createAccount, login, logout }}>{children}</AuthContext.Provider>
}