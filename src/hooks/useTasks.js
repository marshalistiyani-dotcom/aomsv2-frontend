import { useState, useEffect, useCallback } from 'react'
import * as taskService from '../services/taskService'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await taskService.getTasks()
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = useCallback(async (data) => {
    const task = await taskService.createTask(data)
    setTasks((prev) => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback(async (id, data) => {
    const task = await taskService.updateTask(id, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)))
    return task
  }, [])

  const deleteTask = useCallback(async (id) => {
    await taskService.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getTaskById = useCallback(async (id) => {
    return taskService.getTaskById(id)
  }, [])

  return { tasks, loading, createTask, updateTask, deleteTask, getTaskById, refresh: loadTasks }
}
