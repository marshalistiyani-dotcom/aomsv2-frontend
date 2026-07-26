import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as authLogin, logout as authLogout, getCurrentUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const loggedInUser = await authLogin(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
