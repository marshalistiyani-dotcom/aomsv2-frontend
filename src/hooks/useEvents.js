import { useState, useEffect, useCallback } from 'react'
import * as eventService from '../services/eventService'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await eventService.getEvents()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const createEvent = useCallback(async (data) => {
    const event = await eventService.createEvent(data)
    setEvents((prev) => [event, ...prev])
    return event
  }, [])

  const updateEvent = useCallback(async (id, data) => {
    const event = await eventService.updateEvent(id, data)
    setEvents((prev) => prev.map((e) => (e.id === id ? event : e)))
    return event
  }, [])

  const deleteEvent = useCallback(async (id) => {
    await eventService.deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const getEventById = useCallback(async (id) => {
    return eventService.getEventById(id)
  }, [])

  return { events, loading, createEvent, updateEvent, deleteEvent, getEventById, refresh: loadEvents }
}
