import { useState, useEffect, useCallback } from 'react'
import * as eventService from '../services/eventService'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(() => {
    setLoading(true)
    const data = eventService.getEvents()
    setEvents(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const createEvent = useCallback((data) => {
    const event = eventService.createEvent(data)
    setEvents((prev) => [event, ...prev])
    return event
  }, [])

  const updateEvent = useCallback((id, data) => {
    const event = eventService.updateEvent(id, data)
    setEvents((prev) => prev.map((e) => (e.id === id ? event : e)))
    return event
  }, [])

  const deleteEvent = useCallback((id) => {
    eventService.deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const getEventById = useCallback((id) => {
    return eventService.getEventById(id)
  }, [])

  return { events, loading, createEvent, updateEvent, deleteEvent, getEventById, refresh: loadEvents }
}
