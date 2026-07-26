import { useState, useEffect, useCallback } from 'react'
import * as kpiService from '../services/kpiService'

export function useKPI() {
  const [kpiList, setKpiList] = useState([])
  const [loading, setLoading] = useState(true)

  const loadKPI = useCallback(async () => {
    setLoading(true)
    try {
      const data = await kpiService.getKPI()
      setKpiList(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKPI()
  }, [loadKPI])

  const createKPI = useCallback(async (data) => {
    const item = await kpiService.createKPI(data)
    setKpiList((prev) => [item, ...prev])
    return item
  }, [])

  const updateKPI = useCallback(async (id, data) => {
    const item = await kpiService.updateKPI(id, data)
    setKpiList((prev) => prev.map((k) => (k.id === id ? item : k)))
    return item
  }, [])

  const deleteKPI = useCallback(async (id) => {
    await kpiService.deleteKPI(id)
    setKpiList((prev) => prev.filter((k) => k.id !== id))
  }, [])

  const getKPIById = useCallback(async (id) => {
    return kpiService.getKPIById(id)
  }, [])

  return { kpiList, loading, createKPI, updateKPI, deleteKPI, getKPIById, refresh: loadKPI }
}
