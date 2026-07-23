import { useState, useEffect, useCallback } from 'react'
import * as taskService from '../services/taskService'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(() => {
    setLoading(true)
    const data = taskService.getTasks()
    setTasks(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = useCallback((data) => {
    const task = taskService.createTask(data)
    setTasks((prev) => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback((id, data) => {
    const task = taskService.updateTask(id, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)))
    return task
  }, [])

  const deleteTask = useCallback((id) => {
    taskService.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getTaskById = useCallback((id) => {
    return taskService.getTaskById(id)
  }, [])

  return { tasks, loading, createTask, updateTask, deleteTask, getTaskById, refresh: loadTasks }
}
