import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as reportService from '../../services/reportService'
import * as userService from '../../services/userService'
import { formatDate } from '../../utils/helpers'
import { Plus, Trash2, FileText, Download } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, Table as DocTable, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

export default function ReportHistory() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exporting, setExporting] = useState(false)

  const [users, setUsers] = useState([])

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const [r, u] = await Promise.all([
        reportService.getReports(),
        userService.getUsers(),
      ])
      setReports(r)
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    loadReports()
  }, [location.key, loadReports])

  const deleteReport = useCallback(async (id) => {
    await reportService.deleteReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const filtered = reports.filter((r) => {
    if (startDate && endDate) {
      const d = new Date(r.date)
      return d >= new Date(startDate) && d <= new Date(endDate)
    }
    return true
  })

  const getUserName = (id) => users.find((u) => u.id === id)?.name || 'Unknown'

  const handleDelete = (id) => {
    if (confirm('Hapus laporan ini?')) deleteReport(id)
  }

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Pilih rentang tanggal terlebih dahulu.')
      return
    }

    setExporting(true)
    try {
      const rangeReports = await reportService.getReportsByDateRange(startDate, endDate)

      if (rangeReports.length === 0) {
        alert('Tidak ada laporan di rentang tanggal tersebut.')
        return
      }

      const rows = rangeReports.map((r, i) => {
        const author = users.find((u) => u.id === r.userId)
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun(String(i + 1))] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(author?.name || 'Unknown')] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(r.summary || '-')] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(formatDate(r.date))] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(r.notes || '-')] })] }),
          ],
        })
      })

      const headerRow = new TableRow({
        tableHeader: true,
        children: ['No', 'Nama', 'Ringkasan', 'Tanggal', 'Catatan'].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, bold: true, size: 22 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            })
        ),
      })

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'STIFIn Family', bold: true, size: 32 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Laporan Bulanan', size: 26 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, size: 22 }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [new TextRun({ text: `Total Laporan: ${rangeReports.length}`, size: 22 })],
                spacing: { after: 200 },
              }),
              new Paragraph({ spacing: { after: 200 } }),
              new DocTable({
                rows: [headerRow, ...rows],
                width: { size: 100, type: WidthType.PERCENTAGE },
              }),
              new Paragraph({ spacing: { before: 400 } }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Laporan_${startDate}_${endDate}.docx`)
    } catch (err) {
      console.error(err)
      alert('Gagal mengexport laporan.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat laporan harian dan export bulanan</p>
        </div>
        <Button onClick={() => navigate('/reports/daily')}>
          <Plus size={18} className="mr-1" /> Laporan Harian
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Export Laporan Bulanan</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-end gap-4 flex-wrap">
            <Input label="Tanggal Mulai" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Tanggal Akhir" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button onClick={handleExport} disabled={exporting} variant="success">
              <Download size={18} className="mr-1" />
              {exporting ? 'Mengexport...' : 'Export DOCX'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Riwayat Laporan</h2>
        </CardHeader>
        <Table>
          <Thead>
            <Th>Judul</Th>
            <Th>Penulis</Th>
            <Th>Tanggal</Th>
            <Th>Ringkasan</Th>
            <Th className="text-right">Aksi</Th>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center text-gray-400 py-8">Belum ada laporan.</Td>
              </tr>
            ) : (
              filtered.map((report) => (
                <tr key={report.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{report.title}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {getUserName(report.userId).charAt(0)}
                      </div>
                      <span>{getUserName(report.userId)}</span>
                    </div>
                  </Td>
                  <Td>{formatDate(report.date)}</Td>
                  <Td className="max-w-xs truncate">{report.summary}</Td>
                  <Td className="text-right">
                    <button onClick={() => handleDelete(report.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
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
