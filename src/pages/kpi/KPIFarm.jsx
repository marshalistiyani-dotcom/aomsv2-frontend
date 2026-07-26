import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useKPI } from '../../hooks/useKPI'
import { DEPARTMENTS, KPI_PERIODS } from '../../utils/constants'
import { ArrowLeft, Save } from 'lucide-react'

export default function KPIFarm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { createKPI, updateKPI, getKPIById } = useKPI()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    target: 100,
    current: 0,
    unit: '',
    department: '',
    period: 'monthly',
  })

  useEffect(() => {
    if (isEdit) {
      getKPIById(id).then((kpi) => {
        if (kpi) {
          setForm({
            name: kpi.name,
            description: kpi.description || '',
            target: kpi.target,
            current: kpi.current,
            unit: kpi.unit,
            department: kpi.department,
            period: kpi.period,
          })
        }
      })
    }
  }, [id, isEdit, getKPIById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateKPI(id, form)
      } else {
        await createKPI(form)
      }
      navigate('/kpi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/kpi')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit KPI' : 'Tambah KPI Baru'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Perbarui target KPI' : 'Buat indikator kinerja baru'}</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama KPI" name="name" value={form.name} onChange={handleChange} required />

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Target" type="number" name="target" value={form.target} onChange={handleChange} required />
              <Input label="Current" type="number" name="current" value={form.current} onChange={handleChange} required />
              <Input label="Satuan" name="unit" value={form.unit} onChange={handleChange} placeholder="orang, %, dll" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
              <Select
                label="Periode"
                name="period"
                value={form.period}
                onChange={handleChange}
                options={Object.entries(KPI_PERIODS).map(([, v]) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/kpi')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
