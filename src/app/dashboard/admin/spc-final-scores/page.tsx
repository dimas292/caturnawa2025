'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Trophy,
  Users,
  Award,
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Star
} from 'lucide-react'

interface Judge {
  judgeId: string
  judgeName: string
  pemaparanMateriPresentasi: number
  pertanyaanJawaban: number
  aspekKesesuaianTema: number
  catatanPemaparan?: string
  catatanPertanyaan?: string
  catatanKesesuaian?: string
  feedback?: string
  total: number
  createdAt: string
}

interface ScoreData {
  id: string
  participantName: string
  institution: string
  presentationTitle: string
  presentationOrder: number
  scheduledTime?: string
  judgesCount: number
  judges: Judge[]
  avgPemaparan: number
  avgPertanyaan: number
  avgKesesuaian: number
  totalScore: number
  status: string
  createdAt: string
}

export default function SPCFinalScoresPage() {
  const router = useRouter()
  const [scores, setScores] = useState<ScoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/spc-final-scores')
      const data = await response.json()

      if (data.success) {
        setScores(data.data)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const filteredScores = scores.filter(score =>
    score.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.presentationTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ['No', 'Nama Peserta', 'Universitas', 'Judul Presentasi', 'Urutan', 'Jadwal', 'Jumlah Juri', '1. Pemaparan Materi dan Presentasi Ilmiah', '2. Pertanyaan dan Jawaban', '3. Aspek Kesesuaian Dengan Tema', 'Total Score', 'Rata-rata Score']
    const rows = filteredScores.map((score, index) => [
      index + 1,
      score.participantName,
      score.institution,
      score.presentationTitle,
      score.presentationOrder,
      score.scheduledTime || '-',
      score.judgesCount,
      score.avgPemaparan,
      score.avgPertanyaan,
      score.avgKesesuaian,
      score.totalScore,
      (score.totalScore / 3).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spc-final-scores-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const stats = {
    totalParticipants: scores.length,
    evaluated: scores.filter(s => s.judgesCount > 0).length,
    pending: scores.filter(s => s.judgesCount === 0).length,
    avgScore: scores.length > 0
      ? Math.round((scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length) * 100) / 100
      : 0
  }

  // maximum number of judges across current scores (used to render dynamic columns)
  const maxJudges = Math.max(1, ...scores.map(s => s.judges.length))

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/admin')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Hasil Nilai SPC Final</h1>
          <p className="text-gray-600">Tabel penilaian peserta Scientific Paper Competition - Tahap Final</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Finalis</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.evaluated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Dinilai</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Tabel Penilaian Final</CardTitle>
              <CardDescription>Daftar finalis dan nilai presentasi dari setiap juri</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari finalis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredScores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data penilaian'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead>Universitas</TableHead>
                    <TableHead className="text-center">Urutan</TableHead>
                    {/* dynamic judge columns: one column per judge containing kuanti (numbers) and kuali (notes) */}
                    {(() => {
                      const heads = [] as any[]
                      for (let i = 0; i < maxJudges; i++) {
                        heads.push(
                          <TableHead key={`j-${i}`} className="text-center">Juri {i + 1}</TableHead>
                        )
                      }
                      return heads
                    })()}
                    <TableHead className="text-right">Total Score</TableHead>
                    <TableHead className="text-right">Rata-rata</TableHead>
                    <TableHead className="text-center">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((score, index) => (
                    <>
                      <TableRow key={score.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{score.participantName}</div>
                            <div className="text-sm text-gray-500">{score.presentationTitle}</div>
                            {score.scheduledTime && (
                              <div className="text-xs text-gray-400">
                                Jadwal: {score.scheduledTime}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{score.institution}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            #{score.presentationOrder}
                          </Badge>
                        </TableCell>
                        {/* dynamic judge columns: for each judge show kuanti (numeric) and kuali (notes) */}
                        {(() => {
                          const cells = [] as any[]
                          for (let j = 0; j < maxJudges; j++) {
                            const judge = score.judges[j]
                            const notes = judge
                              ? [judge.catatanPemaparan, judge.catatanPertanyaan, judge.catatanKesesuaian]
                                .filter(Boolean)
                                .join(' | ')
                              : ''

                            cells.push(
                              <TableCell key={`cell-${score.id}-j${j}`} className="align-top">
                                <div className="border rounded p-2 max-w-xs">
                                  <div className="text-sm text-gray-700 space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Pemaparan</span>
                                      <span className="font-medium">{judge ? judge.pemaparanMateriPresentasi : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Pertanyaan</span>
                                      <span className="font-medium">{judge ? judge.pertanyaanJawaban : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Kesesuaian</span>
                                      <span className="font-medium">{judge ? judge.aspekKesesuaianTema : '-'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                      <span className="font-semibold">Total</span>
                                      <span className="font-bold text-blue-600">{judge ? judge.total.toFixed(2) : '-'}</span>
                                    </div>
                                  </div>
                                  {notes && (
                                    <div className="pt-2 text-xs text-gray-600">
                                      {notes}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )
                          }
                          return cells
                        })()}
                        <TableCell className="text-right">
                          <span className="font-bold text-lg text-blue-600">
                            {score.judgesCount > 0 ? score.totalScore.toFixed(2) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-lg text-blue-600">
                            {score.judgesCount > 0 ? (score.totalScore / 3).toFixed(2) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {score.judgesCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(score.id)}
                            >
                              {expandedRows.has(score.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>

                      {expandedRows.has(score.id) && score.judges.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={4 + maxJudges + 3} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm mb-3">Detail Penilaian per Juri:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {score.judges.map((judge, idx) => (
                                  <Card
                                    key={idx}
                                    className="border-2 max-h-80 overflow-auto"
                                  >
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm break-words">
                                        {judge.judgeName}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm break-words whitespace-pre-line">
                                      {/* Nilai Kuantitatif */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">1. Pemaparan Materi:</span>
                                          <span className="font-medium">{judge.pemaparanMateriPresentasi}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">2. Pertanyaan & Jawaban:</span>
                                          <span className="font-medium">{judge.pertanyaanJawaban}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">3. Kesesuaian Tema:</span>
                                          <span className="font-medium">{judge.aspekKesesuaianTema}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t">
                                          <span className="font-semibold">Total:</span>
                                          <span className="font-bold text-blue-600">{judge.total}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t">
                                          <span className="font-semibold">Rata-rata:</span>
                                          <span className="font-bold text-blue-600">{(judge.total / 3).toFixed(2)}</span>
                                        </div>
                                      </div>

                                      {/* Catatan Kualitatif */}
                                      {(judge.catatanPemaparan ||
                                        judge.catatanPertanyaan ||
                                        judge.catatanKesesuaian) && (
                                          <div className="pt-2 border-t space-y-1">
                                            <div className="font-semibold text-xs text-gray-700 mb-1">
                                              Penilaian Kualitatif:
                                            </div>

                                            {judge.catatanPemaparan && (
                                              <div className="text-xs">
                                                <span className="font-medium text-gray-600">
                                                  Pemaparan Materi:{' '}
                                                </span>
                                                <span className="text-gray-700">
                                                  {judge.catatanPemaparan}
                                                </span>
                                              </div>
                                            )}

                                            {judge.catatanPertanyaan && (
                                              <div className="text-xs">
                                                <span className="font-medium text-gray-600">
                                                  Sesi Tanya Jawab:{' '}
                                                </span>
                                                <span className="text-gray-700">
                                                  {judge.catatanPertanyaan}
                                                </span>
                                              </div>
                                            )}

                                            {judge.catatanKesesuaian && (
                                              <div className="text-xs">
                                                <span className="font-medium text-gray-600">
                                                  Kesesuaian Tema:{' '}
                                                </span>
                                                <span className="text-gray-700">
                                                  {judge.catatanKesesuaian}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}