import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import { useDailySheets } from '../../hooks/useDailySheets'
import { useAuth } from '../../contexts/AuthContext'
import * as userService from '../../services/userService'
import { formatDate } from '../../utils/helpers'
import { ArrowLeft, Edit, Save, Trash2, FileText, Target, TrendingUp, PhoneCall } from 'lucide-react'

export default function DailySheetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getSheetById, deleteSheet, submitSheet } = useDailySheets()
  const [sheet, setSheet] = useState(null)
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ items: [], notes: '', followedUp: 0 })

  useEffect(() => {
    getSheetById(id).then((data) => {
      setSheet(data)
      setForm({
        items: (data?.items || []).map((it) => ({ ...it })),
        notes: data?.notes || '',
        followedUp: data?.followedUp || 0,
      })
      if (data?.status !== 'reported') setEditing(true)
    })
    userService.getUsers().then(setUsers)
  }, [id, getSheetById])

  if (!sheet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lembar tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tasks')}>Kembali</Button>
      </div>
    )
  }

  const userName = users.find((u) => u.id === sheet.userId)?.name || 'Unknown'
  const totalTarget = sheet.items.reduce((s, it) => s + (Number(it.targetLeads) || 0), 0)
  const totalObtained = sheet.items.reduce((s, it) => s + (Number(it.leadsObtained) || 0), 0)
  const reported = sheet.status === 'reported'

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, [field]: field === 'leadsObtained' ? Number(value) || 0 : value } : it)),
    }))
  }

  const handleDelete = () => {
    if (confirm('Hapus lembar ini?')) {
      deleteSheet(sheet.id)
      navigate('/tasks')
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await submitSheet(sheet.id, form)
      const updated = await getSheetById(sheet.id)
      setSheet(updated)
      setForm({
        items: (updated?.items || []).map((it) => ({ ...it })),
        notes: updated?.notes || '',
        followedUp: updated?.followedUp || 0,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tasks')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lembar Task Harian</h1>
            <p className="text-sm text-gray-500 mt-1">{userName} &middot; {formatDate(sheet.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reported && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit size={16} className="mr-1" /> Ubah Laporan
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/tasks/${sheet.id}/edit`)}>
            <Edit size={16} className="mr-1" /> Edit Lembar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              <span className={`text-xs px-2 py-0.5 rounded-full ${reported ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {reported ? 'Laporan Terisi' : 'Belum Lapor'}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-3">{sheet.items.length} kegiatan</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-orange-500" />
              <p className="text-xs text-gray-500">Target Leads</p>
            </div>
            <p className="text-xl font-bold text-orange-600 mt-3">{totalTarget}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" />
              <p className="text-xs text-gray-500">Leads Didapat</p>
            </div>
            <p className="text-xl font-bold text-green-600 mt-3">{totalObtained}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <PhoneCall size={18} className="text-purple-500" />
              <p className="text-xs text-gray-500">Follow Up</p>
            </div>
            <p className="text-xl font-bold text-purple-600 mt-3">{sheet.followedUp || 0}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Rundown Kegiatan</h2>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Th>Jam</Th>
              <Th>Pekerjaan</Th>
              <Th>Keterangan</Th>
              <Th>Target Leads</Th>
              {editing && (
                <>
                  <Th>Jam Realisasi</Th>
                  <Th>Leads Didapat</Th>
                </>
              )}
            </Thead>
            <Tbody>
              {sheet.items.map((item, index) => (
                <tr key={item.id}>
                  <Td className="whitespace-nowrap">{item.timeStart || '-'}{item.timeEnd ? ` - ${item.timeEnd}` : ''}</Td>
                  <Td><span className="font-medium">{item.work || '-'}</span></Td>
                  <Td><span className="text-gray-500">{item.keterangan || '-'}</span></Td>
                  <Td>{item.targetLeads || 0}</Td>
                  {editing ? (
                    <>
                      <Td>
                        <input
                          type="time"
                          value={form.items[index]?.actualTimeStart || ''}
                          onChange={(e) => handleItemChange(index, 'actualTimeStart', e.target.value)}
                          className={inputClass}
                        />
                      </Td>
                      <Td>
                        <input
                          type="number"
                          min="0"
                          value={form.items[index]?.leadsObtained ?? ''}
                          onChange={(e) => handleItemChange(index, 'leadsObtained', e.target.value)}
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td className="whitespace-nowrap">{item.actualTimeStart ? `${item.actualTimeStart}${item.actualTimeEnd ? ` - ${item.actualTimeEnd}` : ''}` : '-'}</Td>
                      <Td className="font-semibold text-green-600">{item.leadsObtained || 0}</Td>
                    </>
                  )}
                </tr>
              ))}
            </Tbody>
          </Table>

          {editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Catatan (Kendala)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kendala atau hal lain yang perlu dilaporkan"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Jumlah Leads yang Di-follow Up</label>
                <input
                  type="number"
                  min="0"
                  value={form.followedUp ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, followedUp: Number(e.target.value) || 0 }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {editing && (
            <div className="flex items-center gap-3 mt-6">
              <Button onClick={handleSubmit} disabled={saving}>
                <Save size={18} className="mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Laporan'}
              </Button>
              {reported && (
                <Button variant="outline" onClick={() => setEditing(false)}>Batal</Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {reported && !editing && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Catatan Laporan</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{sheet.notes || '-'}</p>
          </CardBody>
        </Card>
      )}

      <p className="text-xs text-gray-400">Dibuat oleh: {user?.name || '-'}</p>
    </div>
  )
}
