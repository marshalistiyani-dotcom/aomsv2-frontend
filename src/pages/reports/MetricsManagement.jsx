import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as metricService from '../../services/metricService'
import { Plus, Trash2, Edit2, Save, X, Globe, Camera, Video, Film } from 'lucide-react'

const PLATFORM_ICONS = {
  'Artikel Website': Globe,
  'Instagram': Camera,
  'TikTok': Video,
  'YouTube': Film,
}



export default function MetricsManagement() {
  const [platforms, setPlatforms] = useState([])
  const [activePlatform, setActivePlatform] = useState('')
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', unit: '' })

  const loadPlatforms = useCallback(async () => {
    const p = await metricService.getPlatforms()
    setPlatforms(p)
    if (p.length > 0 && !activePlatform) setActivePlatform(p[0])
  }, [])

  const loadMetrics = useCallback(async (platform) => {
    if (!platform) return
    setLoading(true)
    try {
      const data = await metricService.getMetrics(platform)
      setMetrics(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlatforms()
  }, [loadPlatforms])

  useEffect(() => {
    loadMetrics(activePlatform)
  }, [activePlatform, loadMetrics])

  const handleAdd = async () => {
    if (!form.name) return
    await metricService.createMetric({ platform: activePlatform, name: form.name, unit: form.unit })
    setForm({ name: '', unit: '' })
    setShowForm(false)
    loadMetrics(activePlatform)
  }

  const handleEdit = async (id) => {
    if (!form.name) return
    await metricService.updateMetric(id, { name: form.name, unit: form.unit })
    setEditingId(null)
    setForm({ name: '', unit: '' })
    loadMetrics(activePlatform)
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus metric ini?')) {
      await metricService.deleteMetric(id)
      loadMetrics(activePlatform)
    }
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setForm({ name: m.name, unit: m.unit })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', unit: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Metrics</h1>
        <p className="text-sm text-gray-500 mt-1">Atur metrik dan input data harian per platform</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {platforms.map((p) => {
          const Icon = PLATFORM_ICONS[p] || Globe
          return (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePlatform === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {p}
            </button>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{activePlatform} — Metrics</h2>
            <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', unit: '' }) }}>
              <Plus size={16} className="mr-1" /> Tambah Metric
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {showForm && (
            <div className="flex items-end gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <Input label="Nama Metric" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Misal: Visitors" />
              <Input label="Satuan" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Misal: visitors" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>
                  <Save size={16} className="mr-1" /> Simpan
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setForm({ name: '', unit: '' }) }}>
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : metrics.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada metric. Klik "Tambah Metric" untuk mulai.</p>
          ) : (
            <Table>
              <Thead>
                <Th>Nama Metric</Th>
                <Th>Satuan</Th>
                <Th className="text-right">Aksi</Th>
              </Thead>
              <Tbody>
                {metrics.map((m) => (
                  <tr key={m.id}>
                    {editingId === m.id ? (
                      <>
                        <Td><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></Td>
                        <Td><Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} /></Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" onClick={() => handleEdit(m.id)}><Save size={14} /></Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}><X size={14} /></Button>
                          </div>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td><span className="font-medium text-gray-900">{m.name}</span></Td>
                        <Td><span className="text-gray-500">{m.unit || '-'}</span></Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </Td>
                      </>
                    )}
                  </tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
