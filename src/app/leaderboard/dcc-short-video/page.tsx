'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCcw, Award, Clock, Crown, TrendingUp } from 'lucide-react'

interface SemifinalJudge {
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

interface FinalJudge {
    judgeId: string
    judgeName: string
    strukturPresentasi: number
    teknikPenyampaian: number
    penguasaanMateri: number
    kolaborasiTeam: number
    total: number
    feedback?: string
    createdAt: string
}

interface SemifinalScoreData {
    id: string
    participantName: string
    institution: string
    judulKarya: string
    judgesCount: number
    judges: SemifinalJudge[]
    avgSinematografi: number
    avgVisualBentuk: number
    avgVisualEditing: number
    avgIsiPesan: number
    totalScore: number
    rank?: number
    isTop7?: boolean
}

interface FinalScoreData {
    id: string
    participantName: string
    institution: string
    judulKarya: string
    judgesCount: number
    judges: FinalJudge[]
    avgStruktur: number
    avgTeknik: number
    avgPenguasaan: number
    avgKolaborasi: number
    totalScore: number
    rank?: number
    isTop3?: boolean
}

type ScoreData = SemifinalScoreData | FinalScoreData
type StageType = 'semifinal' | 'final'

export default function DCCShortVideoLeaderboard() {
    const [stage, setStage] = useState<StageType>('semifinal')
    const [scores, setScores] = useState<ScoreData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        fetchScores()
    }, [stage])

    const fetchScores = async (showLoader = true) => {
        if (showLoader) setLoading(true)
        else setIsRefreshing(true)
        setError(null)

        try {
            const endpoint = stage === 'semifinal'
                ? '/api/public/dcc-short-video'
                : '/api/public/dcc-short-video-final'
            
            
            const res = await fetch(endpoint)
            const data = await res.json()
            
            
            
            if (data.success) {
                
                setScores(data.leaderboard || [])
                setLastUpdated(new Date())
            } else {
                console.error('API returned error:', data.error)
                setError(data.error || 'Gagal memuat data leaderboard')
                setScores([])
            }
        } catch (err) {
            console.error('Error fetching DCC short video leaderboard:', err)
            setError('Gagal memuat data leaderboard')
            setScores([])
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
        if (rank <= 7) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
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
                            <CardDescription className="mt-2">Daftar peringkat peserta DCC Short Video</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-48">
                                <Select value={stage} onValueChange={(value: StageType) => setStage(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tahap" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semifinal">Semifinal</SelectItem>
                                        <SelectItem value="final">Final</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Finalists Highlight Alert */}
            {stage === 'semifinal' && filteredScores.some(s => 'isTop7' in s && s.isTop7) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div>
                            <h3 className="font-semibold text-blue-800 mb-1">Top 7 Finalists</h3>
                            <p className="text-sm text-blue-700">Peserta dengan peringkat 1-7 akan melanjutkan ke babak final</p>
                        </div>
                    </div>
                </div>
            )}

            {stage === 'final' && filteredScores.some(s => 'isTop3' in s && s.isTop3) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div>
                            <h3 className="font-semibold text-yellow-800 mb-1">Top 3 Winners</h3>
                            <p className="text-sm text-yellow-700">Peserta dengan peringkat 1-3 adalah pemenang kompetisi</p>
                        </div>
                    </div>
                </div>
            )}

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
                                    {stage === 'semifinal' ? (
                                        <>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sinematografi</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visual/Bentuk</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visual/Editing</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Isi/Pesan</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Struktur</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Teknik</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Penguasaan</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kolaborasi</th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredScores.map((score) => {
                                    const isHighlighted = stage === 'semifinal'
                                        ? ('isTop7' in score && score.isTop7)
                                        : ('isTop3' in score && score.isTop3)
                                    
                                    return (
                                        <tr key={score.id} className={`hover:bg-gray-50 transition-colors ${isHighlighted ? 'bg-blue-50/50' : ''}`}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-600">#{score.rank}</span>
                                                    <Badge className={getRankBadge(score.rank || 0)}>#{score.rank}</Badge>
                                                    {stage === 'semifinal' && 'isTop7' in score && score.isTop7 && (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Finalist</Badge>
                                                    )}
                                                    {stage === 'final' && 'isTop3' in score && score.isTop3 && (
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Winner</Badge>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{score.participantName}</div>
                                                <div className="text-sm text-gray-500">{score.judulKarya}</div>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{score.institution}</div>
                                            </td>

                                            {/* Score Columns - Conditional based on stage */}
                                            {stage === 'semifinal' && 'avgSinematografi' in score ? (
                                                <>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-purple-600">{score.avgSinematografi?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-indigo-600">{score.avgVisualBentuk?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-pink-600">{score.avgVisualEditing?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-yellow-600">{score.avgIsiPesan?.toFixed(2)}</div></td>
                                                </>
                                            ) : stage === 'final' && 'avgStruktur' in score ? (
                                                <>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-purple-600">{score.avgStruktur?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-indigo-600">{score.avgTeknik?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-pink-600">{score.avgPenguasaan?.toFixed(2)}</div></td>
                                                    <td className="px-4 py-4 text-center"><div className="text-lg font-semibold text-yellow-600">{score.avgKolaborasi?.toFixed(2)}</div></td>
                                                </>
                                            ) : null}

                                            <td className="px-4 py-4 text-center">
                                                <div className="text-2xl font-bold text-green-600">{score.totalScore?.toFixed(2)}</div>
                                                <div className="text-xs text-gray-500">Total</div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredScores.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-2">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                            </div>
                            <p className="text-gray-600 font-medium">
                                {searchQuery
                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                    : `Belum ada data ${stage === 'semifinal' ? 'semifinal' : 'final'} untuk ditampilkan`}
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                {!searchQuery && 'Data akan muncul setelah juri memberikan penilaian'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
