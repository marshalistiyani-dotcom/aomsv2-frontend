import { useState, useEffect, useCallback } from 'react'
import * as userService from '../services/userService'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const createUser = useCallback(async (data) => {
    const user = await userService.createUser(data)
    setUsers((prev) => [...prev, user])
    return user
  }, [])

  const updateUser = useCallback(async (id, data) => {
    const user = await userService.updateUser(id, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

  const deleteUser = useCallback(async (id) => {
    await userService.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const getUserById = useCallback(async (id) => {
    return userService.getUserById(id)
  }, [])

  return { users, loading, createUser, updateUser, deleteUser, getUserById, refresh: loadUsers }
}
