import { api } from './api'

export function getUsers() {
  return api.get('/api/users')
}

export function getUserById(id) {
  return api.get(`/api/users/${id}`)
}

export function createUser(data) {
  return api.post('/api/users', data)
}

export function updateUser(id, data) {
  return api.put(`/api/users/${id}`, data)
}

export function deleteUser(id) {
  return api.delete(`/api/users/${id}`)
}
