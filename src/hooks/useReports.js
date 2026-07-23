import { useState, useEffect, useCallback } from 'react'
import * as reportService from '../services/reportService'

export function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReports = useCallback(() => {
    setLoading(true)
    const data = reportService.getReports()
    setReports(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const createReport = useCallback((data) => {
    const report = reportService.createReport(data)
    setReports((prev) => [report, ...prev])
    return report
  }, [])

  const deleteReport = useCallback((id) => {
    reportService.deleteReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getReportsByDateRange = useCallback((start, end) => {
    return reportService.getReportsByDateRange(start, end)
  }, [])

  return { reports, loading, createReport, deleteReport, getReportsByDateRange, refresh: loadReports }
}
