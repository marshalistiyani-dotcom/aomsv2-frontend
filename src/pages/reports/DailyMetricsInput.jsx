import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as metricService from '../../services/metricService'
import * as dailyMetricService from '../../services/dailyMetricService'
import { formatDate } from '../../utils/helpers'
import { Save, Trash2, Globe, Camera, Video, Film } from 'lucide-react'

const PLATFORM_ICONS = {
  'Artikel Website': Globe,
  'Instagram': Camera,
  'TikTok': Video,
  'YouTube': Film,
}

export default function DailyMetricsInput() {
  const [platforms, setPlatforms] = useState([])
  const [activePlatform, setActivePlatform] = useState('')
  const [metrics, setMetrics] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState({})

  const loadPlatforms = useCallback(async () => {
    const p = await metricService.getPlatforms()
    setPlatforms(p)
    if (p.length > 0 && !activePlatform) setActivePlatform(p[0])
  }, [])

  const loadData = useCallback(async (platform) => {
    if (!platform) return
    setLoading(true)
    try {
      const [m, h] = await Promise.all([
        metricService.getMetrics(platform),
        dailyMetricService.getDailyMetrics({ platform }),
      ])
      setMetrics(m)
      setHistory(h)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlatforms()
  }, [loadPlatforms])

  useEffect(() => {
    loadData(activePlatform)
    setValues({})
  }, [activePlatform, loadData])

  useEffect(() => {
    const todayEntry = history.find((h) => h.date === date)
    if (todayEntry) {
      const v = {}
      todayEntry.values.forEach((item) => {
        v[item.metricId] = item.value
      })
      setValues(v)
    } else {
      setValues({})
    }
  }, [date, history])

  const handleSave = async () => {
    const payload = metrics.map((m) => ({
      metricId: m.id,
      value: Number(values[m.id]) || 0,
    }))
    await dailyMetricService.saveDailyMetric({
      date,
      platform: activePlatform,
      values: payload,
    })
    loadData(activePlatform)
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus entri ini?')) {
      await dailyMetricService.deleteDailyMetric(id)
      loadData(activePlatform)
    }
  }

  const getUserName = (entry) => {
    return entry.userId ? entry.userId.slice(0, 8) : '-'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Input Metrics Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Catat data metrik platform setiap hari</p>
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
          <h2 className="text-base font-semibold text-gray-900">Input Data — {activePlatform}</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            {metrics.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada metric untuk platform ini. Setup dulu di tab Setup Metrics.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((m) => (
                  <Input
                    key={m.id}
                    label={`${m.name} ${m.unit ? '(' + m.unit + ')' : ''}`}
                    type="number"
                    value={values[m.id] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder="0"
                  />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={metrics.length === 0}>
                <Save size={18} className="mr-1" /> Simpan
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Riwayat {activePlatform}</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data.</p>
          ) : (
            <Table>
              <Thead>
                <Th>Tanggal</Th>
                {metrics.map((m) => (
                  <Th key={m.id}>
                    {m.name}
                    {m.unit ? <span className="font-normal text-gray-400"> ({m.unit})</span> : ''}
                  </Th>
                ))}
                <Th className="text-right">Aksi</Th>
              </Thead>
              <Tbody>
                {history.map((entry) => {
                  const valMap = {}
                  entry.values.forEach((v) => { valMap[v.metricId] = v.value })
                  return (
                    <tr key={entry.id}>
                      <Td className="font-medium">{formatDate(entry.date)}</Td>
                      {metrics.map((m) => (
                        <Td key={m.id}>{valMap[m.id] ?? '-'}</Td>
                      ))}
                      <Td className="text-right">
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </Td>
                    </tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
