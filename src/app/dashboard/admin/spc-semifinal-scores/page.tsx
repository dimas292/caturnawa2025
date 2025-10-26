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
  ArrowLeft
} from 'lucide-react'

interface Judge {
  judgeId: string
  judgeName: string
  penilaianKaryaTulisIlmiah: number
  substansiKaryaTulisIlmiah: number
  kualitasKaryaTulisIlmiah: number
  catatanPenilaian?: string
  catatanSubstansi?: string
  catatanKualitas?: string
  total: number
  createdAt: string
}

interface ScoreData {
  id: string
  participantName: string
  institution: string
  email: string
  judulKarya: string
  judgesCount: number
  judges: Judge[]
  avgPenilaian: number
  avgSubstansi: number
  avgKualitas: number
  totalScore: number
  status: string
  qualifiedToFinal: boolean
  createdAt: string
}

export default function SPCSemifinalScoresPage() {
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
      const response = await fetch('/api/admin/spc-semifinal-scores')
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
    score.judulKarya.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ['No', 'Nama Peserta', 'Universitas', 'Judul Karya', 'Jumlah Juri', 'Nilai Penilaian', 'Nilai Substansi', 'Nilai Kualitas', 'Total Score']
    const rows = filteredScores.map((score, index) => [
      index + 1,
      score.participantName,
      score.institution,
      score.judulKarya,
      score.judgesCount,
      score.avgPenilaian,
      score.avgSubstansi,
      score.avgKualitas,
      score.totalScore
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spc-semifinal-scores-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-3xl font-bold mb-2">Hasil Nilai SPC Semifinal</h1>
          <p className="text-gray-600">Tabel penilaian peserta Speech Competition - Tahap Semifinal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Tabel Penilaian</CardTitle>
              <CardDescription>Daftar peserta dan nilai dari setiap juri</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peserta..."
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
                    <TableHead className="text-center">Juri</TableHead>
                    <TableHead className="text-right">Nilai Penilaian Karya Tulis Ilmiah</TableHead>
                    <TableHead className="text-right">Nilai Substansi Karya Tulis Ilmiah</TableHead>
                    <TableHead className="text-right">Nilai Kualitas Karya Tulis Ilmiah</TableHead>
                    <TableHead className="text-right">Total Score</TableHead>
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
                            <div className="text-sm text-gray-500">{score.judulKarya}</div>
                          </div>
                        </TableCell>
                        <TableCell>{score.institution}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={score.judgesCount === 0 ? 'secondary' : 'default'}>
                            {score.judgesCount}/3 Juri
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {score.judgesCount > 0 ? score.avgPenilaian.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {score.judgesCount > 0 ? score.avgSubstansi.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {score.judgesCount > 0 ? score.avgKualitas.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-lg text-blue-600">
                            {score.judgesCount > 0 ? score.totalScore.toFixed(2) : '-'}
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
    <TableCell colSpan={9} className="bg-gray-50 p-4">
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
                    <span className="text-gray-600">Penilaian:</span>
                    <span className="font-medium">{judge.penilaianKaryaTulisIlmiah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Substansi:</span>
                    <span className="font-medium">{judge.substansiKaryaTulisIlmiah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kualitas:</span>
                    <span className="font-medium">{judge.kualitasKaryaTulisIlmiah}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-blue-600">{judge.total}</span>
                  </div>
                      <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Rata-rata :</span>
                    <span className="font-bold text-blue-600">{(judge.total / 3).toFixed(2)}</span>
                  </div>
                </div>

                {/* Catatan Kualitatif */}
                {(judge.catatanPenilaian ||
                  judge.catatanSubstansi ||
                  judge.catatanKualitas) && (
                  <div className="pt-2 border-t space-y-1">
                    <div className="font-semibold text-xs text-gray-700 mb-1">
                      Penilaian Kualitatif:
                    </div>

                    {judge.catatanPenilaian && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">
                          Penilaian Karya Tulis Ilmiah:{' '}
                        </span>
                        <span className="text-gray-700">
                          {judge.catatanPenilaian}
                        </span>
                      </div>
                    )}

                    {judge.catatanSubstansi && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">
                          Substansi Karya Tulis Ilmiah:{' '}
                        </span>
                        <span className="text-gray-700">
                          {judge.catatanSubstansi}
                        </span>
                      </div>
                    )}

                    {judge.catatanKualitas && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">
                          Kualitas Karya Tulis Ilmiah:{' '}
                        </span>
                        <span className="text-gray-700">
                          {judge.catatanKualitas}
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
