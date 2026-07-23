import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import * as kpiService from '../../services/kpiService'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function KPIList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [kpiList, setKpiList] = useState([])
  const [loading, setLoading] = useState(true)

  const loadKPI = useCallback(() => {
    setLoading(true)
    setKpiList(kpiService.getKPI())
    setLoading(false)
  }, [])

  useEffect(() => {
    loadKPI()
  }, [loadKPI])

  useEffect(() => {
    loadKPI()
  }, [location.key, loadKPI])

  const getProgressColor = (current, target) => {
    const pct = (current / target) * 100
    if (pct >= 80) return 'bg-green-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KPI</h1>
        <p className="text-sm text-gray-500 mt-1">Key Performance Indicators</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {kpiList.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-400 py-8">Belum ada data KPI.</p>
            </CardBody>
          </Card>
        ) : (
          kpiList.map((kpi) => {
            const progress = Math.min(Math.round((kpi.current / kpi.target) * 100), 100)
            const isOnTrack = progress >= 50

            return (
              <Card key={kpi.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/kpi/${kpi.id}`)}>
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{kpi.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{kpi.description}</p>
                    </div>
                    <Badge className={`${isOnTrack ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ml-4`}>
                      {isOnTrack ? (
                        <><TrendingUp size={14} className="mr-1" /> On Track</>
                      ) : (
                        <><TrendingDown size={14} className="mr-1" /> Behind</>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-700">
                        {kpi.current} / {kpi.target} {kpi.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${getProgressColor(kpi.current, kpi.target)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{kpi.department}</span>
                      <span className="capitalize">{kpi.period}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
