import { useState, useEffect, useCallback } from 'react'
import * as reportService from '../services/reportService'

export function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await reportService.getReports()
      setReports(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const createReport = useCallback(async (data) => {
    const report = await reportService.createReport(data)
    setReports((prev) => [report, ...prev])
    return report
  }, [])

  const deleteReport = useCallback(async (id) => {
    await reportService.deleteReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getReportsByDateRange = useCallback(async (start, end) => {
    return reportService.getReportsByDateRange(start, end)
  }, [])

  return { reports, loading, createReport, deleteReport, getReportsByDateRange, refresh: loadReports }
}
