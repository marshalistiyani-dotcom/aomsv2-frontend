import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import * as dailySheetService from '../../services/dailySheetService'
import * as userService from '../../services/userService'
import { formatDateShort } from '../../utils/helpers'
import { Plus, FileText, Target, Clock } from 'lucide-react'

export default function DailySheets() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sheets, setSheets] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')

  const loadSheets = useCallback(async () => {
    setLoading(true)
    try {
      const [s, u] = await Promise.all([
        dailySheetService.getDailySheets(date ? { date } : {}),
        userService.getUsers(),
      ])
      setSheets(s)
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    loadSheets()
  }, [loadSheets])

  useEffect(() => {
    loadSheets()
  }, [location.key, loadSheets])

  const groupedByUser = {}
  users.forEach((u) => {
    const userSheets = sheets.filter((s) => s.userId === u.id)
    if (userSheets.length > 0) {
      groupedByUser[u.id] = { user: u, sheets: userSheets }
    }
  })

  const totalTarget = (sheet) => (sheet.items || []).reduce((sum, it) => sum + (Number(it.targetLeads) || 0), 0)
  const totalObtained = (sheet) => (sheet.items || []).reduce((sum, it) => sum + (Number(it.leadsObtained) || 0), 0)

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Harian</h1>
          <p className="text-sm text-gray-500 mt-1">Lembar rundown pekerjaan harian per tim, lengkap dengan target leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <Button onClick={() => navigate('/tasks/new')}>
            <Plus size={18} className="mr-1" /> Buat Lembar
          </Button>
        </div>
      </div>

      {Object.keys(groupedByUser).length === 0 ? (
        <Card>
          <CardBody className="text-center text-gray-400 py-12">Belum ada lembar task harian.</CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedByUser).map(([userId, { user, sheets: userSheets }]) => (
            <div key={userId} className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                  <p className="text-xs text-gray-400">{user.department} &middot; {userSheets.length} lembar</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {userSheets.filter(s => s.status === 'reported').length}/{userSheets.length} terlapor
                </Badge>
              </div>

              <div className="space-y-2">
                {userSheets.map((sheet) => (
                  <Card
                    key={sheet.id}
                    className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                      sheet.status === 'reported' ? 'border-l-green-500' : 'border-l-amber-400'
                    }`}
                    onClick={() => navigate(`/tasks/${sheet.id}`)}
                  >
                    <CardBody className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className={sheet.status === 'reported' ? 'text-green-500' : 'text-gray-400'} />
                          <span className="text-sm font-medium text-gray-900">{formatDateShort(sheet.date)}</span>
                        </div>
                        <Badge className={`text-xs ${sheet.status === 'reported' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {sheet.status === 'reported' ? 'Laporan Terisi' : 'Belum Lapor'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={12} />{sheet.items?.length || 0} kegiatan</span>
                        <span className="flex items-center gap-1"><Target size={12} />Target: {totalTarget(sheet)}</span>
                        <span className="flex items-center gap-1 text-green-600">Didapat: {totalObtained(sheet)}</span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
