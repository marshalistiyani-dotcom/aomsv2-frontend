import { api } from './api'

export function getMetrics(platform) {
  const query = platform ? `?platform=${platform}` : ''
  return api.get(`/api/metrics${query}`)
}

export function getPlatforms() {
  return api.get('/api/metrics/platforms')
}

export function createMetric(data) {
  return api.post('/api/metrics', data)
}

export function updateMetric(id, data) {
  return api.put(`/api/metrics/${id}`, data)
}

export function deleteMetric(id) {
  return api.delete(`/api/metrics/${id}`)
}
