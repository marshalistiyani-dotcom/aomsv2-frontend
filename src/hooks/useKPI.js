import { useState, useEffect, useCallback } from 'react'
import * as kpiService from '../services/kpiService'

export function useKPI() {
  const [kpiList, setKpiList] = useState([])
  const [loading, setLoading] = useState(true)

  const loadKPI = useCallback(() => {
    setLoading(true)
    const data = kpiService.getKPI()
    setKpiList(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadKPI()
  }, [loadKPI])

  const createKPI = useCallback((data) => {
    const item = kpiService.createKPI(data)
    setKpiList((prev) => [item, ...prev])
    return item
  }, [])

  const updateKPI = useCallback((id, data) => {
    const item = kpiService.updateKPI(id, data)
    setKpiList((prev) => prev.map((k) => (k.id === id ? item : k)))
    return item
  }, [])

  const deleteKPI = useCallback((id) => {
    kpiService.deleteKPI(id)
    setKpiList((prev) => prev.filter((k) => k.id !== id))
  }, [])

  const getKPIById = useCallback((id) => {
    return kpiService.getKPIById(id)
  }, [])

  return { kpiList, loading, createKPI, updateKPI, deleteKPI, getKPIById, refresh: loadKPI }
}
