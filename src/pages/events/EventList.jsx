import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as eventService from '../../services/eventService'
import * as userService from '../../services/userService'
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/helpers'
import { EVENT_STATUS } from '../../utils/constants'
import { Plus, Trash2, Edit, MapPin, Calendar } from 'lucide-react'

export default function EventList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadEvents = useCallback(() => {
    setLoading(true)
    setEvents(eventService.getEvents())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    loadEvents()
  }, [location.key, loadEvents])

  const deleteEvent = useCallback((id) => {
    eventService.deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const users = userService.getUsers()

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const getPICName = (id) => users.find((u) => u.id === id)?.name || 'Unknown'

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (confirm('Hapus event ini?')) deleteEvent(id)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola jadwal kegiatan dan acara</p>
        </div>
        <Button onClick={() => navigate('/events/new')}>
          <Plus size={18} className="mr-1" /> Tambah Event
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select
              options={[
                { value: '', label: 'Semua Status' },
                    ...Object.entries(EVENT_STATUS).map(([, v]) => ({ value: v, label: getStatusLabel(v) })),
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <Table>
          <Thead>
            <Th>Event</Th>
            <Th>Tanggal</Th>
            <Th>Lokasi</Th>
            <Th>PIC</Th>
            <Th>Status</Th>
            <Th className="text-right">Aksi</Th>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-center text-gray-400 py-8">Belum ada event.</Td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/events/${event.id}`)}>
                  <Td>
                    <span className="font-medium text-gray-900">{event.title}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(event.date)}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {event.location}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {getPICName(event.pic).charAt(0)}
                      </div>
                      <span className="text-sm">{getPICName(event.pic)}</span>
                    </div>
                  </Td>
                  <Td><Badge className={getStatusColor(event.status)}>{getStatusLabel(event.status)}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}/edit`) }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(event.id, e)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
