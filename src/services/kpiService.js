import { api } from './api'

export function getKPI() {
  return api.get('/api/kpi')
}

export function getKPIById(id) {
  return api.get(`/api/kpi/${id}`)
}

export function createKPI(data) {
  return api.post('/api/kpi', data)
}

export function updateKPI(id, data) {
  return api.put(`/api/kpi/${id}`, data)
}

export function deleteKPI(id) {
  return api.delete(`/api/kpi/${id}`)
}
