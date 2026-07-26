import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useTasks } from '../../hooks/useTasks'
import * as userService from '../../services/userService'
import { formatDate, formatDateTime, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel, isOverdue, getProgressColor, getProgressTextColor } from '../../utils/helpers'
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock, AlertCircle } from 'lucide-react'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTaskById, deleteTask, updateTask } = useTasks()
  const [task, setTask] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    getTaskById(id).then(setTask)
    userService.getUsers().then(setUsers)
  }, [id, getTaskById])

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tasks')}>Kembali</Button>
      </div>
    )
  }

  const assignee = users.find((u) => u.id === task.assignee)
  const creator = users.find((u) => u.id === task.createdBy)
  const overdue = isOverdue(task.dueDate) && task.status !== 'done'

  const handleDelete = () => {
    if (confirm('Hapus task ini?')) {
      deleteTask(task.id)
      navigate('/tasks')
    }
  }

  const handleQuickProgress = (delta) => {
    const newProgress = Math.min(Math.max((task.progress || 0) + delta, 0), 100)
    const newStatus = newProgress >= 100 ? 'done' : newProgress > 0 ? 'in_progress' : 'todo'
    updateTask(task.id, { progress: newProgress, status: newStatus })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tasks')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Detail task</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" /> Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
            <Badge className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
            {overdue && <Badge className="bg-red-100 text-red-700"><AlertCircle size={12} className="mr-0.5" />Overdue</Badge>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Progress</h3>
              <span className={`text-lg font-bold ${getProgressTextColor(task.progress || 0)}`}>
                {task.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressColor(task.progress || 0)}`}
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleQuickProgress(-10)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 hover:bg-gray-100 rounded"
              >
                -10%
              </button>
              <button
                onClick={() => handleQuickProgress(10)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 hover:bg-gray-100 rounded"
              >
                +10%
              </button>
            </div>
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Deskripsi</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
            {task.timeStart && task.timeEnd && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Jam Kerja</p>
                  <p className="text-sm font-medium text-gray-900">{task.timeStart} - {task.timeEnd}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Assignee</p>
                <p className="text-sm font-medium text-gray-900">{assignee?.name || 'Unassigned'}</p>
                <p className="text-xs text-gray-400">{assignee?.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Dibuat oleh</p>
                <p className="text-sm font-medium text-gray-900">{creator?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{formatDateTime(task.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
