import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

function getAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]')
}

function saveAll(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

export function getTasks() {
  return getAll()
}

export function getTaskById(id) {
  return getAll().find((t) => t.id === id) || null
}

export function createTask(data) {
  const tasks = getAll()
  const now = new Date().toISOString()
  const task = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  tasks.unshift(task)
  saveAll(tasks)
  return task
}

export function updateTask(id, data) {
  const tasks = getAll()
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Task not found')
  tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() }
  saveAll(tasks)
  return tasks[idx]
}

export function deleteTask(id) {
  const tasks = getAll().filter((t) => t.id !== id)
  saveAll(tasks)
}
