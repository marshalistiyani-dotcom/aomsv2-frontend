import { useState, useEffect, useCallback } from 'react'
import * as dailySheetService from '../services/dailySheetService'

export function useDailySheets() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSheets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dailySheetService.getDailySheets()
      setSheets(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSheets()
  }, [loadSheets])

  const createSheet = useCallback(async (data) => {
    const sheet = await dailySheetService.createDailySheet(data)
    setSheets((prev) => [sheet, ...prev])
    return sheet
  }, [])

  const updateSheet = useCallback(async (id, data) => {
    const sheet = await dailySheetService.updateDailySheet(id, data)
    setSheets((prev) => prev.map((s) => (s.id === id ? sheet : s)))
    return sheet
  }, [])

  const deleteSheet = useCallback(async (id) => {
    await dailySheetService.deleteDailySheet(id)
    setSheets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const submitSheet = useCallback(async (id, data) => {
    return dailySheetService.submitDailySheet(id, data)
  }, [])

  const getSheetById = useCallback(async (id) => {
    return dailySheetService.getDailySheetById(id)
  }, [])

  return { sheets, loading, createSheet, updateSheet, deleteSheet, submitSheet, getSheetById, refresh: loadSheets }
}
