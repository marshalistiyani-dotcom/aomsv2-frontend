import { api } from './api'

export function getTasks() {
  return api.get('/api/tasks')
}

export function getTaskById(id) {
  return api.get(`/api/tasks/${id}`)
}

export function createTask(data) {
  return api.post('/api/tasks', data)
}

export function updateTask(id, data) {
  return api.put(`/api/tasks/${id}`, data)
}

export function deleteTask(id) {
  return api.delete(`/api/tasks/${id}`)
}
