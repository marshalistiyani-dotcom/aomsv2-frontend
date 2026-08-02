import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useDailySheets } from '../../hooks/useDailySheets'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/userService'
import { generateId } from '../../utils/helpers'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

const newItem = () => ({
  id: generateId(),
  timeStart: '',
  timeEnd: '',
  work: '',
  keterangan: '',
  targetLeads: 0,
  actualTimeStart: '',
  actualTimeEnd: '',
  leadsObtained: 0,
})

export default function DailySheetForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createSheet, updateSheet, getSheetById } = useDailySheets()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    userId: user?.id || '',
    items: [newItem()],
  })

  useEffect(() => {
    userService.getUsers().then(setUsers)
  }, [])

  useEffect(() => {
    if (isEdit) {
      getSheetById(id).then((sheet) => {
        if (sheet) {
          setForm({
            date: sheet.date,
            userId: sheet.userId,
            items: (sheet.items || []).map((it) => ({ ...newItem(), ...it })),
          })
        }
      })
    }
  }, [id, isEdit, getSheetById])

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = prev.items.map((it, i) => (i === index ? { ...it, [field]: field === 'targetLeads' ? Number(value) || 0 : value } : it))
      return { ...prev, items }
    })
  }

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem()] }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.items.length === 0) {
      alert('Tambahkan minimal satu rundown.')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await updateSheet(id, form)
      } else {
        await createSheet({ ...form, createdBy: user.id })
      }
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Lembar Task Harian' : 'Buat Lembar Task Harian'}</h1>
          <p className="text-sm text-gray-500 mt-1">Susun rundown kegiatan beserta target leads per aktivitas</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Tanggal" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
              <Select
                label="Nama Tim"
                value={form.userId}
                onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                options={users.map((u) => ({ value: u.id, label: u.name }))}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Rundown Kegiatan</label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus size={14} className="mr-1" /> Tambah Baris
                </Button>
              </div>

              {form.items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Belum ada rundown. Tambahkan baris kegiatan.</p>
              ) : (
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Kegiatan {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Jam Mulai" type="time" value={item.timeStart} onChange={(e) => handleItemChange(index, 'timeStart', e.target.value)} />
                        <Input label="Jam Selesai" type="time" value={item.timeEnd} onChange={(e) => handleItemChange(index, 'timeEnd', e.target.value)} />
                      </div>
                      <Input label="Pekerjaan" value={item.work} onChange={(e) => handleItemChange(index, 'work', e.target.value)} placeholder="Apa yang dikerjakan?" />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Keterangan (reason & goal)</label>
                        <textarea
                          value={item.keterangan}
                          onChange={(e) => handleItemChange(index, 'keterangan', e.target.value)}
                          rows={2}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Kenapa dan target apa yang ingin dicapai dari kegiatan ini"
                        />
                      </div>
                      <Input
                        label="Target Leads"
                        type="number"
                        min="0"
                        value={item.targetLeads ?? ''}
                        onChange={(e) => handleItemChange(index, 'targetLeads', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan Lembar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
