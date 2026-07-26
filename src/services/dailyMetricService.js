import { api } from './api'

export function getDailyMetrics(params = {}) {
  const q = new URLSearchParams()
  if (params.platform) q.set('platform', params.platform)
  if (params.startDate) q.set('startDate', params.startDate)
  if (params.endDate) q.set('endDate', params.endDate)
  const query = q.toString() ? `?${q}` : ''
  return api.get(`/api/daily-metrics${query}`)
}

export function getDailyMetricsSummary(period) {
  return api.get(`/api/daily-metrics/summary?period=${period}`)
}

export function saveDailyMetric(data) {
  return api.post('/api/daily-metrics', data)
}

export function deleteDailyMetric(id) {
  return api.delete(`/api/daily-metrics/${id}`)
}
