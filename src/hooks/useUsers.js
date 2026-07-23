import { useState, useEffect, useCallback } from 'react'
import * as userService from '../services/userService'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(() => {
    setLoading(true)
    const data = userService.getUsers()
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const createUser = useCallback((data) => {
    const user = userService.createUser(data)
    setUsers((prev) => [...prev, user])
    return user
  }, [])

  const updateUser = useCallback((id, data) => {
    const user = userService.updateUser(id, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

  const deleteUser = useCallback((id) => {
    userService.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const getUserById = useCallback((id) => {
    return userService.getUserById(id)
  }, [])

  return { users, loading, createUser, updateUser, deleteUser, getUserById, refresh: loadUsers }
}
