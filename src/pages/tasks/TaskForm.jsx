import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useTasks } from '../../hooks/useTasks'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/userService'
import { TASK_STATUS, PRIORITY } from '../../utils/constants'
import { getStatusLabel, getPriorityLabel, getProgressColor } from '../../utils/helpers'
import { ArrowLeft, Save } from 'lucide-react'

export default function TaskForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createTask, updateTask, getTaskById } = useTasks()
  const [users] = useState(() => userService.getUsers())
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    timeStart: '',
    timeEnd: '',
    progress: 0,
    assignee: user.id,
  })

  useEffect(() => {
    if (isEdit) {
      const task = getTaskById(id)
      if (task) {
        setForm({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          timeStart: task.timeStart || '',
          timeEnd: task.timeEnd || '',
          progress: task.progress || 0,
          assignee: task.assignee,
        })
      }
    }
  }, [id, isEdit, getTaskById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'status') {
        if (value === 'done') updated.progress = 100
        else if (value === 'todo') updated.progress = 0
      }
      if (name === 'progress') {
        const pct = Math.min(Math.max(parseInt(value) || 0, 0), 100)
        updated.progress = pct
        if (pct >= 100) updated.status = 'done'
        else if (pct > 0) updated.status = 'in_progress'
        else updated.status = 'todo'
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateTask(id, form)
      } else {
        await createTask({ ...form, createdBy: user.id })
      }
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Task' : 'Tambah Task Baru'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Perbarui detail task' : 'Buat target atau rencana kerja baru'}</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Judul Task" name="title" value={form.title} onChange={handleChange} required />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Progress</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    name="progress"
                    min="0"
                    max="100"
                    step="5"
                    value={form.progress}
                    onChange={handleChange}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-sm font-mono font-medium w-8 text-right">{form.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(form.progress)}`}
                    style={{ width: `${form.progress}%` }}
                  />
                </div>
              </div>
              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={Object.entries(TASK_STATUS).map(([, v]) => ({ value: v, label: getStatusLabel(v) }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Prioritas"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                options={Object.entries(PRIORITY).map(([, v]) => ({ value: v, label: getPriorityLabel(v) }))}
              />
              <Input label="Due Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Jam Mulai" type="time" name="timeStart" value={form.timeStart} onChange={handleChange} />
              <Input label="Jam Selesai" type="time" name="timeEnd" value={form.timeEnd} onChange={handleChange} />
            </div>

            <Select
              label="Assignee"
              name="assignee"
              value={form.assignee}
              onChange={handleChange}
              options={users.map((u) => ({ value: u.id, label: u.name }))}
            />

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
