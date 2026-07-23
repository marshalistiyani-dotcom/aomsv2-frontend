import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

function getAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]')
}

function saveAll(events) {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
}

export function getEvents() {
  return getAll()
}

export function getEventById(id) {
  return getAll().find((e) => e.id === id) || null
}

export function createEvent(data) {
  const events = getAll()
  const now = new Date().toISOString()
  const event = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  events.unshift(event)
  saveAll(events)
  return event
}

export function updateEvent(id, data) {
  const events = getAll()
  const idx = events.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = { ...events[idx], ...data, updatedAt: new Date().toISOString() }
  saveAll(events)
  return events[idx]
}

export function deleteEvent(id) {
  const events = getAll().filter((e) => e.id !== id)
  saveAll(events)
}
