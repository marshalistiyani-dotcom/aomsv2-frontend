import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useEvents } from '../../hooks/useEvents'
import * as userService from '../../services/userService'
import * as eventService from '../../services/eventService'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Clock, FileText, Save, X } from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, deleteEvent, updateEvent } = useEvents()
  const [event, setEvent] = useState(null)
  const [users, setUsers] = useState([])
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportForm, setReportForm] = useState({ totalParticipants: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getEventById(id).then(setEvent)
    userService.getUsers().then(setUsers)
  }, [id, getEventById])

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Event tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/events')}>Kembali</Button>
      </div>
    )
  }

  const pic = users.find((u) => u.id === event.pic)

  const handleDelete = () => {
    if (confirm('Hapus event ini?')) {
      deleteEvent(event.id)
      navigate('/events')
    }
  }

  const handleSubmitReport = async () => {
    setSubmitting(true)
    try {
      const updated = await eventService.updateEventReport(event.id, {
        totalParticipants: Number(reportForm.totalParticipants) || 0,
        notes: reportForm.notes,
      })
      setEvent(updated)
      setShowReportForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const hasReport = event.report && event.report.createdAt

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/events')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Detail event</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/events/${event.id}/edit`)}>
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" /> Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(event.status)}>{getStatusLabel(event.status)}</Badge>
          </div>

          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Deskripsi</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(event.date)}</p>
              </div>
            </div>
            {event.time && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Waktu</p>
                  <p className="text-sm font-medium text-gray-900">{event.time}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Lokasi</p>
                <p className="text-sm font-medium text-gray-900">{event.location || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">PIC</p>
                <p className="text-sm font-medium text-gray-900">{pic?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{pic?.department}</p>
              </div>
            </div>
          </div>

          {event.status === 'completed' && !hasReport && (
            <div className="border-t border-gray-200 pt-4">
              <Button onClick={() => setShowReportForm(true)} variant="outline">
                <FileText size={16} className="mr-1" /> Tambah Laporan Event
              </Button>
            </div>
          )}

          {showReportForm && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Laporan Event</h3>
              <Input
                label="Jumlah Peserta Hadir"
                type="number"
                value={reportForm.totalParticipants}
                onChange={(e) => setReportForm((p) => ({ ...p, totalParticipants: e.target.value }))}
                placeholder="0"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea
                  value={reportForm.notes}
                  onChange={(e) => setReportForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kendala, dokumentasi, dll"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSubmitReport} disabled={submitting}>
                  <Save size={16} className="mr-1" /> Simpan Laporan
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReportForm(false)}>
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {hasReport && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Laporan Event</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-500">Total Peserta Hadir</p>
                  <p className="text-xl font-bold text-blue-700">{event.report.totalParticipants}</p>
                </div>
              </div>
              {event.report.notes && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Catatan</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.report.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Dilaporkan pada: {formatDate(event.report.createdAt)}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
