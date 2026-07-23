import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

function getAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.KPI) || '[]')
}

function saveAll(kpi) {
  localStorage.setItem(STORAGE_KEYS.KPI, JSON.stringify(kpi))
}

export function getKPI() {
  return getAll()
}

export function getKPIById(id) {
  return getAll().find((k) => k.id === id) || null
}

export function createKPI(data) {
  const list = getAll()
  const now = new Date().toISOString()
  const item = { id: generateId(), ...data, createdAt: now, updatedAt: now }
  list.unshift(item)
  saveAll(list)
  return item
}

export function updateKPI(id, data) {
  const list = getAll()
  const idx = list.findIndex((k) => k.id === id)
  if (idx === -1) throw new Error('KPI not found')
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
  saveAll(list)
  return list[idx]
}

export function deleteKPI(id) {
  const list = getAll().filter((k) => k.id !== id)
  saveAll(list)
}
