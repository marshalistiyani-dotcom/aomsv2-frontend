import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import * as taskService from '../../services/taskService'
import * as userService from '../../services/userService'
import { formatDateShort, getPriorityColor, getPriorityLabel, isOverdue, getProgressColor, getProgressTextColor } from '../../utils/helpers'
import { Plus, CheckCircle, Circle, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

export default function TaskList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadTasks = useCallback(() => {
    setLoading(true)
    setTasks(taskService.getTasks())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    loadTasks()
  }, [location.key, loadTasks])

  const updateTask = useCallback((id, data) => {
    const updated = taskService.updateTask(id, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [])

  const users = userService.getUsers()

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const groupedByAssignee = {}
  users.forEach((u) => {
    const userTasks = filtered.filter((t) => t.assignee === u.id)
    if (userTasks.length > 0) {
      groupedByAssignee[u.id] = { user: u, tasks: userTasks }
    }
  })

  const handleToggleDone = (task, e) => {
    e.stopPropagation()
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const newProgress = newStatus === 'done' ? 100 : 0
    updateTask(task.id, { status: newStatus, progress: newProgress })
  }

  const handleProgressChange = (task, delta, e) => {
    e.stopPropagation()
    const newProgress = Math.min(Math.max((task.progress || 0) + delta, 0), 100)
    const newStatus = newProgress >= 100 ? 'done' : newProgress > 0 ? 'in_progress' : 'todo'
    updateTask(task.id, { progress: newProgress, status: newStatus })
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Daily planner — per orang</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Cari task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 sm:w-64"
          />
          <Button onClick={() => navigate('/tasks/new')}>
            <Plus size={18} className="mr-1" /> Tambah Task
          </Button>
        </div>
      </div>

      {Object.keys(groupedByAssignee).length === 0 ? (
        <Card>
          <CardBody className="text-center text-gray-400 py-12">Belum ada task.</CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedByAssignee).map(([assigneeId, { user: assignee, tasks: userTasks }]) => (
            <div key={assigneeId} className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {assignee.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{assignee.name}</h3>
                  <p className="text-xs text-gray-400">{assignee.department} &middot; {userTasks.length} tasks</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">{userTasks.filter(t => t.status === 'done').length}/{userTasks.length}</Badge>
              </div>

              <div className="space-y-2">
                {userTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'done'
                  return (
                    <Card
                      key={task.id}
                      className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                        task.status === 'done' ? 'border-l-green-500 opacity-75' :
                        overdue ? 'border-l-red-500' :
                        task.priority === 'urgent' ? 'border-l-red-400' :
                        task.priority === 'high' ? 'border-l-orange-400' :
                        'border-l-blue-400'
                      }`}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <CardBody className="p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <button onClick={(e) => handleToggleDone(task, e)} className="mt-0.5 shrink-0">
                            {task.status === 'done' ? (
                              <CheckCircle size={18} className="text-green-500" />
                            ) : (
                              <Circle size={18} className="text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {task.timeStart && task.timeEnd && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={12} />
                                  {task.timeStart} - {task.timeEnd}
                                </span>
                              )}
                              <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                {formatDateShort(task.dueDate)}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${getPriorityColor(task.priority)} text-xs shrink-0`}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 pl-7">
                          <button
                            onClick={(e) => handleProgressChange(task, -10, e)}
                            className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${getProgressColor(task.progress || 0)}`}
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <button
                            onClick={(e) => handleProgressChange(task, 10, e)}
                            className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <ChevronRight size={14} />
                          </button>
                          <span className={`text-xs font-medium w-7 text-right ${getProgressTextColor(task.progress || 0)}`}>
                            {task.progress || 0}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 pl-7">
                          {task.status === 'done' && <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>}
                          {overdue && <Badge className="bg-red-100 text-red-700 text-xs"><AlertCircle size={10} className="mr-0.5" />Overdue</Badge>}
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
