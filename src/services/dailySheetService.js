import { api } from './api'

export function getDailySheets(params = {}) {
  const q = new URLSearchParams()
  if (params.date) q.set('date', params.date)
  if (params.userId) q.set('userId', params.userId)
  const query = q.toString() ? `?${q}` : ''
  return api.get(`/api/daily-sheets${query}`)
}

export function getDailySheetById(id) {
  return api.get(`/api/daily-sheets/${id}`)
}

export function createDailySheet(data) {
  return api.post('/api/daily-sheets', data)
}

export function updateDailySheet(id, data) {
  return api.put(`/api/daily-sheets/${id}`, data)
}

export function deleteDailySheet(id) {
  return api.delete(`/api/daily-sheets/${id}`)
}

export function submitDailySheet(id, data) {
  return api.post(`/api/daily-sheets/${id}/submit`, data)
}
