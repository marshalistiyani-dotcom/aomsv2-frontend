import { STORAGE_KEYS } from '../utils/constants'
import { mockUsers } from './mockUsers'
import { mockTasks } from './mockTasks'
import { mockEvents } from './mockEvents'
import { mockKPI } from './mockKPI'
import { mockReports } from './mockReports'

export function seedData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(mockTasks))
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents))
  }
  if (!localStorage.getItem(STORAGE_KEYS.KPI)) {
    localStorage.setItem(STORAGE_KEYS.KPI, JSON.stringify(mockKPI))
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mockReports))
  }
}
