import { STORAGE_KEYS } from '../utils/constants'

export function login(email, password) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) {
    throw new Error('Email atau password salah')
  }
  const { password: _, ...safeUser } = user
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser))
  return safeUser
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER)
  return raw ? JSON.parse(raw) : null
}
