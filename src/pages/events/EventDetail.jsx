import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useEvents } from '../../hooks/useEvents'
import * as userService from '../../services/userService'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Clock } from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, deleteEvent } = useEvents()
  const event = getEventById(id)
  const users = userService.getUsers()

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
        </CardBody>
      </Card>
    </div>
  )
}
