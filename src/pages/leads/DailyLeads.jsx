import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import * as kpiService from '../../services/kpiService'
import * as userService from '../../services/userService'
import * as leadService from '../../services/leadService'
import { formatDate } from '../../utils/helpers'
import { Save, Trash2, Target, TrendingUp } from 'lucide-react'

export default function DailyLeads() {
  const [kpiList, setKpiList] = useState([])
  const [users, setUsers] = useState([])
  const [selectedKpi, setSelectedKpi] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState({})
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  const loadData = useCallback(async () => {
    const [k, u] = await Promise.all([kpiService.getKPI(), userService.getUsers()])
    setKpiList(k)
    setUsers(u)
    if (!selectedKpi && k.length > 0) setSelectedKpi(k[0].id)
  }, [selectedKpi])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadEntries = useCallback(async (kpiId, d) => {
    if (!kpiId) return
    setLoading(true)
    try {
      const [dayEntries, monthSummary, allEntries] = await Promise.all([
        leadService.getLeads({ kpiId, date: d }),
        leadService.getLeadSummary(kpiId, d.slice(0, 7)),
        leadService.getLeads({ kpiId }),
      ])
      const map = {}
      dayEntries.forEach((e) => { map[e.userId] = { target: e.target, actual: e.actual, id: e.id } })
      setEntries(map)
      setSummary(monthSummary)
      setHistory(allEntries)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries(selectedKpi, date)
  }, [selectedKpi, date, loadEntries])

  const kpi = kpiList.find((k) => k.id === selectedKpi)

  const handleChange = (userId, field, value) => {
    setEntries((prev) => {
      const current = prev[userId] || { target: kpi?.dailyTarget || 0, actual: 0 }
      return { ...prev, [userId]: { ...current, [field]: Number(value) || 0 } }
    })
  }

  const handleSave = async (userId) => {
    const entry = entries[userId] || { target: kpi?.dailyTarget || 0, actual: 0 }
    setSavingId(userId)
    try {
      await leadService.saveLead({
        date,
        kpiId: selectedKpi,
        userId,
        target: entry.target,
        actual: entry.actual,
      })
      await loadEntries(selectedKpi, date)
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus entri leads ini?')) {
      await leadService.deleteLead(id)
      await loadEntries(selectedKpi, date)
    }
  }

  const todayActual = Object.values(entries).reduce((sum, e) => sum + (e.actual || 0), 0)
  const todayTarget = Object.values(entries).reduce((sum, e) => sum + (e.target || 0), 0)
  const monthProgress = summary?.kpi?.target > 0 ? Math.min(Math.round((summary.totalActual / summary.kpi.target) * 100), 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Target Leads Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Catat target & realisasi leads per orang untuk mendukung pencapaian KPI</p>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="KPI"
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value)}
              options={kpiList.map((k) => ({ value: k.id, label: k.name }))}
            />
            <Input label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {kpi && kpi.dailyTarget > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Target harian per orang: <span className="font-medium text-gray-700">{kpi.dailyTarget}</span> {kpi.unit}
            </p>
          )}
        </CardBody>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <p className="text-2xl font-bold text-gray-900">{todayActual}</p>
              <p className="text-xs text-gray-500 mt-1">Realisasi Hari Ini</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <p className="text-2xl font-bold text-gray-900">{todayTarget}</p>
              <p className="text-xs text-gray-500 mt-1">Target Hari Ini</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <p className="text-2xl font-bold text-gray-900">{summary.totalActual}</p>
              <p className="text-xs text-gray-500 mt-1">Akumulasi {summary.period}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <p className="text-2xl font-bold text-gray-900">{summary.remaining}</p>
              <p className="text-xs text-gray-500 mt-1">Sisa Menuju Target KPI ({summary.kpi.unit})</p>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Input Leads — {formatDate(date)}</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada user.</p>
          ) : (
            <Table>
              <Thead>
                <Th>Nama</Th>
                <Th>Departemen</Th>
                <Th>Target</Th>
                <Th>Realisasi</Th>
                <Th className="text-right">Aksi</Th>
              </Thead>
              <Tbody>
                {users.map((u) => {
                  const entry = entries[u.id]
                  return (
                    <tr key={u.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </Td>
                      <Td><span className="text-gray-500">{u.department}</span></Td>
                      <Td>
                        <input
                          type="number"
                          min="0"
                          value={entry?.target ?? kpi?.dailyTarget ?? 0}
                          onChange={(e) => handleChange(u.id, 'target', e.target.value)}
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </Td>
                      <Td>
                        <input
                          type="number"
                          min="0"
                          value={entry?.actual ?? 0}
                          onChange={(e) => handleChange(u.id, 'actual', e.target.value)}
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </Td>
                      <Td className="text-right">
                        <Button size="sm" onClick={() => handleSave(u.id)} disabled={savingId === u.id}>
                          <Save size={14} className="mr-1" /> {savingId === u.id ? '...' : 'Simpan'}
                        </Button>
                      </Td>
                    </tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Progress {summary?.kpi?.name || 'KPI'} Bulan Ini</h2>
        </CardHeader>
        <CardBody>
          {!summary || summary.daysCount === 0 ? (
            <p className="text-sm text-gray-400 italic py-4 text-center">Belum ada entri bulan ini.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Realisasi</span>
                <span className="font-medium text-gray-700">
                  {summary.totalActual} / {summary.kpi.target} {summary.kpi.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${monthProgress >= 80 ? 'bg-green-500' : monthProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Target size={14} />
                {summary.daysCount} hari tercatat
                <Badge className="bg-blue-100 text-blue-700 text-xs ml-2">
                  <TrendingUp size={10} className="mr-0.5" /> Total target: {summary.totalTarget}
                </Badge>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Riwayat Leads</h2>
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
                <Th>Nama</Th>
                <Th>Target</Th>
                <Th>Realisasi</Th>
                <Th className="text-right">Aksi</Th>
              </Thead>
              <Tbody>
                {history.map((entry) => {
                  const user = users.find((u) => u.id === entry.userId)
                  const hit = entry.target > 0 ? Math.round((entry.actual / entry.target) * 100) : 0
                  return (
                    <tr key={entry.id}>
                      <Td className="font-medium">{formatDate(entry.date)}</Td>
                      <Td>{user?.name || entry.userId}</Td>
                      <Td>{entry.target}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          {entry.actual}
                          {entry.target > 0 && (
                            <Badge className={`text-xs ${hit >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {hit}%
                            </Badge>
                          )}
                        </span>
                      </Td>
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
