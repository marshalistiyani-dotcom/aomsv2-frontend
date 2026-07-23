import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useReports } from '../../hooks/useReports'
import { useTasks } from '../../hooks/useTasks'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import { ArrowLeft, Save, CheckCircle, Circle } from 'lucide-react'

export default function DailyReport() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createReport } = useReports()
  const { tasks } = useTasks()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((t) => t.assignee === user.id)

  const [form, setForm] = useState({
    title: `Laporan Harian - ${formatDate(today)}`,
    summary: '',
    notes: '',
    date: today,
    userId: user.id,
    taskIds: [],
  })

  const toggleTask = (taskId) => {
    setForm((prev) => ({
      ...prev,
      taskIds: prev.taskIds.includes(taskId)
        ? prev.taskIds.filter((id) => id !== taskId)
        : [...prev.taskIds, taskId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createReport({
        ...form,
        type: 'daily',
      })
      navigate('/reports')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/reports')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Harian</h1>
          <p className="text-sm text-gray-500 mt-1">Catat implementasi kerja harian kamu</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Judul Laporan" name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <Input label="Tanggal" type="date" name="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Ringkasan</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Apa yang kamu kerjakan hari ini?"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Task yang Dikerjakan</label>
              {todayTasks.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Belum ada task untuk kamu.</p>
              ) : (
                <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                  {todayTasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <button type="button" onClick={() => toggleTask(task.id)}>
                        {form.taskIds.includes(task.id) ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} className="text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{task.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{task.priority} priority</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Kendala atau hal lain yang perlu dicatat"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan Laporan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/reports')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
