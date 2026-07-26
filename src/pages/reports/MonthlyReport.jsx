import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as reportService from '../../services/reportService'
import * as userService from '../../services/userService'
import { formatDate } from '../../utils/helpers'
import { Download, RefreshCw, FileText, Trash2, CheckCircle, BarChart3, Calendar, Globe } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, Table as DocTable, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

export default function MonthlyReport() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState(null)
  const [allReports, setAllReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const [r, u] = await Promise.all([
        reportService.getReports(),
        userService.getUsers(),
      ])
      setAllReports(r.filter((rep) => rep.type === 'monthly'))
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReports() }, [])

  const handleGenerate = async () => {
    if (!period) return
    setGenerating(true)
    try {
      const result = await reportService.createMonthlyReport({ period, notes })
      setReport(result)
      loadReports()
    } catch (err) {
      alert('Gagal generate: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus laporan ini?')) {
      await reportService.deleteReport(id)
      if (report?.id === id) setReport(null)
      loadReports()
    }
  }

  const getUserName = (id) => users.find((u) => u.id === id)?.name || 'Unknown'

  const getMonthName = (p) => {
    const [y, m] = p.split('-')
    const d = new Date(y, m - 1, 1)
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
  }

  const handleExport = async () => {
    if (!report) return
    setExporting(true)
    try {
      const ts = report.taskSummary || {}
      const kp = report.kpiProgress || []
      const er = report.eventReports || []
      const metrics = report.metrics || {}

      const children = []

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'STIFIn Family', bold: true, size: 32 })], alignment: AlignmentType.CENTER }),
        new Paragraph({ children: [new TextRun({ text: 'Laporan Bulanan', size: 26 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: `Periode: ${getMonthName(report.period)}`, size: 22 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      )

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Ringkasan Tasks', bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
        new DocTable({
          rows: [
            new TableRow({ tableHeader: true, children: ['Status', 'Jumlah'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun('Completed')] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun(String(ts.completed || 0))] })] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun('In Progress')] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun(String(ts.inProgress || 0))] })] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun('Undone')] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun(String(ts.undone || 0))] })] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(ts.total || 0), bold: true })] })] })] }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      )

      if (kp.length > 0) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: 'Progress KPI', bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
          new DocTable({
            rows: [
              new TableRow({ tableHeader: true, children: ['KPI', 'Target', 'Realisasi', 'Satuan', 'Capaian'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
              ...kp.map(k => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(k.name)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(String(k.target))] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(String(k.current))] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(k.unit)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(`${k.percentage}%`)] })] }),
                ],
              })),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        )
      }

      if (er.length > 0) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: 'Laporan Event', bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
          new DocTable({
            rows: [
              new TableRow({ tableHeader: true, children: ['Event', 'Tanggal', 'Peserta', 'Catatan'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
              ...er.map(e => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(e.title)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(e.date || '-')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(String(e.totalParticipants || 0))] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(e.notes || '-')] })] }),
                ],
              })),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        )
      }

      if (Object.keys(metrics).length > 0) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: 'Daily Metrics', bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
        )
        for (const [platform, mData] of Object.entries(metrics)) {
          children.push(
            new Paragraph({ children: [new TextRun({ text: platform, bold: true, size: 20 })], spacing: { before: 200, after: 100 } }),
            new DocTable({
              rows: [
                new TableRow({ tableHeader: true, children: ['Metric', 'Total', 'Rata-rata', 'Satuan'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
                ...Object.entries(mData).map(([, d]) => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun(d.name)] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun(String(d.total))] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun(String(Math.round(d.average * 10) / 10))] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun(d.unit)] })] }),
                  ],
                })),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          )
        }
      }

      if (report.notes) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: 'Catatan & Analisis', bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
          new Paragraph({ children: [new TextRun(report.notes)], spacing: { after: 200 } }),
        )
      }

      children.push(
        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({ children: [new TextRun({ text: `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, size: 18, color: '888888' })] }),
      )

      const doc = new Document({ sections: [{ children }] })
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Laporan_Bulanan_${report.period}.docx`)
    } catch (err) {
      console.error(err)
      alert('Gagal export.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Bulanan</h1>
          <p className="text-sm text-gray-500 mt-1">Generate laporan bulanan komprehensif</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Generate Laporan</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-4 flex-wrap">
            <Input label="Periode" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <Button onClick={handleGenerate} disabled={generating}>
              <RefreshCw size={18} className={`mr-1 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Mengenerate...' : 'Generate'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{report.title}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={handleExport} disabled={exporting}>
                  <Download size={16} className="mr-1" />
                  {exporting ? 'Mengexport...' : 'Export DOCX'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {report.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Catatan & Analisis</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.notes}</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-500" />
                <h3 className="text-sm font-semibold text-gray-900">Realisasi Tasks</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: report.taskSummary?.total || 0, color: 'text-gray-900' },
                  { label: 'Completed', value: report.taskSummary?.completed || 0, color: 'text-green-600' },
                  { label: 'In Progress', value: report.taskSummary?.inProgress || 0, color: 'text-blue-600' },
                  { label: 'Undone', value: report.taskSummary?.undone || 0, color: 'text-red-600' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {report.kpiProgress?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={18} className="text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Progress KPI</h3>
                </div>
                <Table>
                  <Thead>
                    <Th>KPI</Th>
                    <Th>Target</Th>
                    <Th>Realisasi</Th>
                    <Th>Capaian</Th>
                  </Thead>
                  <Tbody>
                    {report.kpiProgress.map((k) => (
                      <tr key={k.kpiId}>
                        <Td><span className="font-medium">{k.name}</span></Td>
                        <Td>{k.target} {k.unit}</Td>
                        <Td>{k.current} {k.unit}</Td>
                        <Td>
                          <span className={`font-semibold ${k.percentage >= 100 ? 'text-green-600' : k.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {k.percentage}%
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}

            {report.eventReports?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Event Completed</h3>
                </div>
                <Table>
                  <Thead>
                    <Th>Event</Th>
                    <Th>Tanggal</Th>
                    <Th>Peserta</Th>
                    <Th>Catatan</Th>
                  </Thead>
                  <Tbody>
                    {report.eventReports.map((e) => (
                      <tr key={e.eventId}>
                        <Td><span className="font-medium">{e.title}</span></Td>
                        <Td>{e.date ? formatDate(e.date) : '-'}</Td>
                        <Td>{e.totalParticipants || 0}</Td>
                        <Td>{e.notes || '-'}</Td>
                      </tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}

            {Object.keys(report.metrics || {}).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={18} className="text-teal-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Daily Metrics</h3>
                </div>
                {Object.entries(report.metrics).map(([platform, mData]) => (
                  <div key={platform} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{platform}</h4>
                    <Table>
                      <Thead>
                        <Th>Metric</Th>
                        <Th>Total</Th>
                        <Th>Rata-rata</Th>
                        <Th>Satuan</Th>
                      </Thead>
                      <Tbody>
                        {Object.entries(mData).map(([metricId, d]) => (
                          <tr key={metricId}>
                            <Td>{d.name}</Td>
                            <Td className="font-semibold">{d.total}</Td>
                            <Td>{Math.round(d.average * 10) / 10}</Td>
                            <Td className="text-gray-500">{d.unit}</Td>
                          </tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Riwayat Laporan Bulanan</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : allReports.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada laporan bulanan.</p>
          ) : (
            <Table>
              <Thead>
                <Th>Judul</Th>
                <Th>Periode</Th>
                <Th>Penulis</Th>
                <Th className="text-right">Aksi</Th>
              </Thead>
              <Tbody>
                {allReports.map((r) => (
                  <tr key={r.id}>
                    <Td>
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setReport(r)}>
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-medium text-blue-600 hover:underline">{r.title}</span>
                      </div>
                    </Td>
                    <Td>{getMonthName(r.period)}</Td>
                    <Td>{getUserName(r.userId)}</Td>
                    <Td className="text-right">
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </Td>
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
