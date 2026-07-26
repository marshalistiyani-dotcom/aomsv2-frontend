import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import * as taskService from '../services/taskService'
import * as eventService from '../services/eventService'
import * as kpiService from '../services/kpiService'
import * as reportService from '../services/reportService'
import * as userService from '../services/userService'
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel, isOverdue } from '../utils/helpers'
import { CheckSquare, Calendar, Users, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const location = useLocation()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [kpiList, setKpiList] = useState([])
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])

  const loadData = useCallback(async () => {
    try {
      const [t, e, k, r, u] = await Promise.all([
        taskService.getTasks(),
        eventService.getEvents(),
        kpiService.getKPI(),
        reportService.getReports(),
        userService.getUsers(),
      ])
      setTasks(t)
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

  const doneTasks = tasks.filter((t) => t.status === 'done')
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done')
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
  const totalKPI = kpiList.length
  const kpiOnTrack = kpiList.filter((k) => (k.current / k.target) >= 0.5).length

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Tasks Done', value: doneTasks.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Overdue', value: overdueTasks.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'KPI On Track', value: `${kpiOnTrack}/${totalKPI}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Users', value: users.length, icon: Users, color: 'text-teal-600', bg: 'bg-teal-100' },
  ]

  const recentReports = [...reports].slice(0, 5)
  const myTasks = tasks.filter((t) => t.assignee === user.id)

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
            <h2 className="text-base font-semibold text-gray-900">My Tasks Summary</h2>
          </CardHeader>
          <CardBody className="p-0">
            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-500 p-6">Belum ada task.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {myTasks.slice(0, 5).map((task) => (
                  <li key={task.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {task.status === 'done' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : isOverdue(task.dueDate) ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : task.status === 'in_progress' ? (
                        <Clock size={16} className="text-blue-500" />
                      ) : (
                        <Clock size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
                      <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Recent Activities</h2>
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
                      <p className="text-sm text-gray-700">{report.summary}</p>
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
