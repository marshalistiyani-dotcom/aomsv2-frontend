import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useKPI } from '../../hooks/useKPI'
import { ArrowLeft, Target, Edit, Trash2 } from 'lucide-react'

export default function KPIProgress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getKPIById, deleteKPI } = useKPI()
  const [kpi, setKpi] = useState(null)

  useEffect(() => {
    getKPIById(id).then(setKpi)
  }, [id, getKPIById])

  if (!kpi) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">KPI tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/kpi')}>Kembali</Button>
      </div>
    )
  }

  const progress = Math.min(Math.round((kpi.current / kpi.target) * 100), 100)
  const remaining = Math.max(kpi.target - kpi.current, 0)

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'text-green-600'
    if (pct >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleDelete = () => {
    if (confirm('Hapus KPI ini?')) {
      deleteKPI(kpi.id)
      navigate('/kpi')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/kpi')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{kpi.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Detail progress KPI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/kpi/${kpi.id}/edit`)}>
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" /> Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{kpi.department}</p>
                <p className="text-sm text-gray-400 capitalize">{kpi.period}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-6xl font-bold ${getProgressColor(progress)}`}>{progress}%</p>
            <p className="text-sm text-gray-500 mt-2">dari target tercapai</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={`grid grid-cols-1 gap-4 ${kpi.dailyTarget > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.current}</p>
              <p className="text-xs text-gray-500 mt-1">Current</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.target}</p>
              <p className="text-xs text-gray-500 mt-1">Target</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900">{remaining}</p>
              <p className="text-xs text-gray-500 mt-1">Sisa ({kpi.unit})</p>
            </div>
            {kpi.dailyTarget > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{kpi.dailyTarget}</p>
                <p className="text-xs text-blue-500 mt-1">Target Leads Harian</p>
              </div>
            )}
          </div>

          {kpi.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Deskripsi</h3>
              <p className="text-sm text-gray-600">{kpi.description}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
