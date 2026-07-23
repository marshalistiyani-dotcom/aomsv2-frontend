import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

function getAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
}

function saveAll(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

function stripPassword(user) {
  if (!user) return null
  const { password: _, ...rest } = user
  return rest
}

export function getUsers() {
  return getAll().map(stripPassword)
}

export function getUserById(id) {
  return stripPassword(getAll().find((u) => u.id === id))
}

export function createUser(data) {
  const users = getAll()
  if (users.find((u) => u.email === data.email)) {
    throw new Error('Email sudah terdaftar')
  }
  const now = new Date().toISOString()
  const user = {
    id: generateId(),
    ...data,
    password: data.password || '123456',
    createdAt: now,
  }
  users.push(user)
  saveAll(users)
  return stripPassword(user)
}

export function updateUser(id, data) {
  const users = getAll()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found')
  const { password, ...rest } = data
  users[idx] = {
    ...users[idx],
    ...rest,
    ...(password ? { password } : {}),
    updatedAt: new Date().toISOString(),
  }
  saveAll(users)
  return stripPassword(users[idx])
}

export function deleteUser(id) {
  const users = getAll().filter((u) => u.id !== id)
  saveAll(users)
}
