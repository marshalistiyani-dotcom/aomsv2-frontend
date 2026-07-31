import { api } from './api'

export function getLeads(params = {}) {
  const q = new URLSearchParams()
  if (params.kpiId) q.set('kpiId', params.kpiId)
  if (params.userId) q.set('userId', params.userId)
  if (params.date) q.set('date', params.date)
  if (params.startDate) q.set('startDate', params.startDate)
  if (params.endDate) q.set('endDate', params.endDate)
  const query = q.toString() ? `?${q}` : ''
  return api.get(`/api/leads${query}`)
}

export function getLeadSummary(kpiId, period) {
  return api.get(`/api/leads/summary?kpiId=${kpiId}&period=${period}`)
}

export function saveLead(data) {
  return api.post('/api/leads', data)
}

export function deleteLead(id) {
  return api.delete(`/api/leads/${id}`)
}
