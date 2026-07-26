import { api } from './api'

export function getEvents() {
  return api.get('/api/events')
}

export function getEventById(id) {
  return api.get(`/api/events/${id}`)
}

export function createEvent(data) {
  return api.post('/api/events', data)
}

export function updateEvent(id, data) {
  return api.put(`/api/events/${id}`, data)
}

export function deleteEvent(id) {
  return api.delete(`/api/events/${id}`)
}
