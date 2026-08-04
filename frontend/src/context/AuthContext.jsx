import { createContext, useContext, useEffect, useState } from 'react'
import api, { clearStoredTokens, getStoredToken, setStoredTokens } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const syncProfile = async () => {
    const response = await api.get('/users/me/')
    setUser(response.data)
    return response.data
  }

  useEffect(() => {
    const restoreSession = async () => {
      const token = getStoredToken('talentsync_access_token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        await syncProfile()
      } catch (error) {
        clearStoredTokens()
        setUser(null)
        setSessionError('Stored session expired. Please sign in again.')
      } finally {
        setLoading(false)
      }
    }

    const handleLogoutEvent = () => {
      setUser(null)
      setSessionError('Your session expired. Sign in again to continue.')
    }

    restoreSession()
    window.addEventListener('talentsync-auth-logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('talentsync-auth-logout', handleLogoutEvent)
    }
  }, [])

  const login = async ({ username, password }) => {
    const response = await api.post('/users/login/', { username, password })
    setStoredTokens({ access: response.data.access, refresh: response.data.refresh })
    const profile = response.data.user ?? (await syncProfile())
    setUser(profile)
    setSessionError('')
    return profile
  }

  const register = async (userData) => {
    const response = await api.post('/users/register/', userData)
    return response.data
  }

  const logout = () => {
    clearStoredTokens()
    setUser(null)
    setSessionError('')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sessionError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}