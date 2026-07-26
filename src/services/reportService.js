import { api } from './api'

export function getReports() {
  return api.get('/api/reports')
}

export function getReportsByDateRange(startDate, endDate) {
  return api.get(`/api/reports/range?start=${startDate}&end=${endDate}`)
}

export async function getReportsByUserId(userId) {
  const all = await getReports()
  return all.filter((r) => r.userId === userId)
}

export function createReport(data) {
  return api.post('/api/reports', data)
}

export function deleteReport(id) {
  return api.delete(`/api/reports/${id}`)
}

export function getReportById(id) {
  return api.get(`/api/reports/${id}`)
}

export function updateReport(id, data) {
  return api.put(`/api/reports/${id}`, data)
}

export function createMonthlyReport(data) {
  return api.post('/api/reports/monthly', data)
}
