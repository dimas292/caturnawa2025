'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCcw, Award, Clock } from 'lucide-react'

interface Judge {
  judgeId: string
  judgeName: string
  sinematografi: number
  visualBentuk: number
  visualEditing: number
  isiPesan: number
  total: number
  feedback?: string
  createdAt: string
}

interface ScoreData {
  id: string
  participantName: string
  institution: string
  judulKarya: string
  judgesCount: number
  judges: Judge[]
  avgSinematografi: number
  avgVisualBentuk: number
  avgVisualEditing: number
  avgIsiPesan: number
  totalScore: number
  rank?: number
  isTop6?: boolean
}

export default function DCCShortVideoLeaderboard() {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    else setIsRefreshing(true)
    setError(null)

    try {
      const res = await fetch('/api/public/dcc-short-video')
      const data = await res.json()
      if (data.success) {
        setScores(data.leaderboard || [])
        setLastUpdated(new Date())
      } else {
        setError('Gagal memuat data leaderboard')
      }
    } catch (err) {
      console.error('Error fetching DCC short video leaderboard:', err)
      setError('Gagal memuat data leaderboard')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => fetchScores(false)

  const filteredScores = scores.filter(score =>
    score.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.judulKarya.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    if (rank <= 6) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) return (<div className="flex items-center justify-center min-h-48"><RefreshCcw className="animate-spin mr-2" />Loading leaderboard...</div>)

  if (error) return (
    <Card className="border-red-200">
      <CardContent className="p-6">
        <div className="text-red-600"><strong>Error:</strong> {error}</div>
        <Button onClick={() => fetchScores()} className="mt-4">Try Again</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Award className="h-8 w-8 text-blue-600" />
                DCC Short Video Leaderboard
              </CardTitle>
              <CardDescription className="mt-2">Daftar peringkat peserta DCC Short Video</CardDescription>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" disabled={isRefreshing} className="gap-2">
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Cari peserta, institusi, atau judul karya..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {lastUpdated && (
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center justify-end gap-1">
                  <Clock className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{lastUpdated.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peringkat Peserta ({filteredScores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institusi</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sinematografi</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visual/Bentuk</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visual/Editing</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Isi/Pesan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredScores.map((score) => (
                  <tr key={score.id} className={`hover:bg-gray-50 transition-colors ${score.isTop6 ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-600">#{score.rank}</span>
                        <Badge className={getRankBadge(score.rank || 0)}>#{score.rank}</Badge>
                        {score.isTop6 && <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Finalist</Badge>}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{score.participantName}</div>
                      <div className="text-sm text-gray-500">{score.judulKarya}</div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{score.institution}</div>
                    </td>

                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-purple-600">{score.avgSinematografi?.toFixed(2)}</div></td>
                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-indigo-600">{score.avgVisualBentuk?.toFixed(2)}</div></td>
                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-pink-600">{score.avgVisualEditing?.toFixed(2)}</div></td>
                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-yellow-600">{score.avgIsiPesan?.toFixed(2)}</div></td>

                    <td className="px-4 py-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{score.totalScore?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredScores.length === 0 && (<div className="text-center py-8 text-gray-500">Tidak ada data yang sesuai dengan pencarian</div>)}
        </CardContent>
      </Card>
    </div>
  )
}
