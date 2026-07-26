import { api, setToken, removeToken, getToken } from './api'

export async function login(email, password) {
  const data = await api.post('/api/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export function logout() {
  removeToken()
}

export async function getCurrentUser() {
  const token = getToken()
  if (!token) return null
  try {
    const data = await api.get('/api/auth/me')
    return data.user
  } catch {
    removeToken()
    return null
  }
}

export { getToken }
