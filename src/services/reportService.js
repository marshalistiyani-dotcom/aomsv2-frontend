import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

function getAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]')
}

function saveAll(reports) {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
}

export function getReports() {
  return getAll()
}

export function getReportsByDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return getAll().filter((r) => {
    const d = new Date(r.date)
    return d >= start && d <= end
  })
}

export function getReportsByUserId(userId) {
  return getAll().filter((r) => r.userId === userId)
}

export function createReport(data) {
  const reports = getAll()
  const now = new Date().toISOString()
  const report = {
    id: generateId(),
    ...data,
    taskIds: data.taskIds || [],
    createdAt: now,
  }
  reports.unshift(report)
  saveAll(reports)
  return report
}

export function deleteReport(id) {
  const reports = getAll().filter((r) => r.id !== id)
  saveAll(reports)
}
