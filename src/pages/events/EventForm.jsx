import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useEvents } from '../../hooks/useEvents'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/userService'
import { EVENT_STATUS } from '../../utils/constants'
import { getStatusLabel } from '../../utils/helpers'
import { ArrowLeft, Save } from 'lucide-react'

export default function EventForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createEvent, updateEvent, getEventById } = useEvents()
  const [users] = useState(() => userService.getUsers())
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    pic: user.id,
    status: 'upcoming',
  })

  useEffect(() => {
    if (isEdit) {
      const event = getEventById(id)
      if (event) {
        setForm({
          title: event.title,
          description: event.description || '',
          date: event.date,
          time: event.time || '',
          location: event.location || '',
          pic: event.pic,
          status: event.status,
        })
      }
    }
  }, [id, isEdit, getEventById])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateEvent(id, form)
      } else {
        await createEvent({ ...form, createdBy: user.id })
      }
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/events')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Tambah Event Baru'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Perbarui detail event' : 'Buat kegiatan atau acara baru'}</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Judul Event" name="title" value={form.title} onChange={handleChange} required />

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
              <Input label="Tanggal" type="date" name="date" value={form.date} onChange={handleChange} required />
              <Input label="Waktu" type="time" name="time" value={form.time} onChange={handleChange} />
            </div>

            <Input label="Lokasi" name="location" value={form.location} onChange={handleChange} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="PIC"
                name="pic"
                value={form.pic}
                onChange={handleChange}
                options={users.map((u) => ({ value: u.id, label: u.name }))}
              />
              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={Object.entries(EVENT_STATUS).map(([, v]) => ({ value: v, label: getStatusLabel(v) }))}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
