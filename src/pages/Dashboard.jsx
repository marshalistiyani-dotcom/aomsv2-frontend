import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import * as dailySheetService from '../services/dailySheetService'
import * as eventService from '../services/eventService'
import * as kpiService from '../services/kpiService'
import * as reportService from '../services/reportService'
import * as userService from '../services/userService'
import { formatDate, getStatusColor, getStatusLabel, isOverdue } from '../utils/helpers'
import { FileText, CheckCircle, AlertCircle, Calendar, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const location = useLocation()
  const { user } = useAuth()
  const [sheets, setSheets] = useState([])
  const [events, setEvents] = useState([])
  const [kpiList, setKpiList] = useState([])
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])

  const loadData = useCallback(async () => {
    try {
      const [s, e, k, r, u] = await Promise.all([
        dailySheetService.getDailySheets(),
        eventService.getEvents(),
        kpiService.getKPI(),
        reportService.getReports(),
        userService.getUsers(),
      ])
      setSheets(s)
      setEvents(e)
      setKpiList(k)
      setReports(r)
      setUsers(u)
    } catch {}
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [location.key, loadData])

  const today = new Date().toISOString().split('T')[0]
  const todaySheets = sheets.filter((s) => s.date === today)
  const reportedToday = todaySheets.filter((s) => s.status === 'reported').length
  const overdueSheets = sheets.filter((s) => s.date < today && s.status !== 'reported')
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
  const totalKPI = kpiList.length
  const kpiOnTrack = kpiList.filter((k) => (k.current / k.target) >= 0.5).length

  const stats = [
    { label: 'Lembar Hari Ini', value: todaySheets.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Terlapor Hari Ini', value: reportedToday, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Belum Lapor', value: overdueSheets.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'KPI On Track', value: `${kpiOnTrack}/${totalKPI}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Users', value: users.length, icon: Users, color: 'text-teal-600', bg: 'bg-teal-100' },
  ]

  const recentReports = [...reports].slice(0, 5)
  const mySheets = sheets.filter((s) => s.userId === user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Selamat datang, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Lembar Saya</h2>
          </CardHeader>
          <CardBody className="p-0">
            {mySheets.length === 0 ? (
              <p className="text-sm text-gray-500 p-6">Belum ada lembar task harian.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {mySheets.slice(0, 5).map((sheet) => {
                  const totalObtained = (sheet.items || []).reduce((s, it) => s + (Number(it.leadsObtained) || 0), 0)
                  const overdue = isOverdue(sheet.date) && sheet.status !== 'reported'
                  return (
                    <li key={sheet.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {sheet.status === 'reported' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : overdue ? (
                          <AlertCircle size={16} className="text-red-500" />
                        ) : (
                          <FileText size={16} className="text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm text-gray-700">{formatDate(sheet.date)}</p>
                          <p className="text-xs text-gray-400">{totalObtained} leads didapat</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(sheet.status === 'reported' ? 'done' : 'todo')}>
                        {getStatusLabel(sheet.status === 'reported' ? 'done' : 'todo')}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Recent Reports</h2>
          </CardHeader>
          <CardBody className="p-0">
            {recentReports.length === 0 ? (
              <p className="text-sm text-gray-500 p-6">Belum ada laporan.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentReports.map((report) => {
                  const author = users.find((u) => u.id === report.userId)
                  return (
                    <li key={report.id} className="px-6 py-3">
                      <p className="text-sm text-gray-700">{report.summary || report.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {author?.name || 'Unknown'} &middot; {formatDate(report.date)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
