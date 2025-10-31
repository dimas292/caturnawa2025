'use client'

import { useState, useEffect } from 'react'
import { hasFinalPrivateScoring } from '@/lib/scoring/hasFinalPrivateScoring'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCcw, Crown, Medal, Award, TrendingUp, Clock } from 'lucide-react'

interface Judge {
    judgeId: string
    judgeName: string
    penilaianKaryaTulisIlmiah: number
    substansiKaryaTulisIlmiah: number
    kualitasKaryaTulisIlmiah: number
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
    rank?: number
    isTop6?: boolean
}

export default function SPCLeaderboard({ hideStageSelector = false }: { hideStageSelector?: boolean }) {
    const [scores, setScores] = useState<ScoreData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Determine whether final scores for SPC should be hidden
    const isFinalPrivate = hasFinalPrivateScoring('FINAL', 'SPC')

    useEffect(() => {
        // If final scores are private, still fetch semifinal leaderboard (this component shows SPC semifinal)
        fetchScores()
    }, [])

    const fetchScores = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true)
        } else {
            setIsRefreshing(true)
        }
        setError(null)
        try {
            const response = await fetch('/api/admin/spc-semifinal-scores')
            const data = await response.json()

            if (data.success) {
                const sortedScores = data.data
                    .map((score: any) => ({
                        ...score,
                        totalScore: score.avgPenilaian + score.avgSubstansi + score.avgKualitas
                    }))
                    .sort((a: any, b: any) => b.totalScore - a.totalScore)
                    .map((score: any, index: number) => ({
                        ...score,
                        rank: index + 1,
                        isTop6: index < 6
                    }))

                setScores(sortedScores)
                setLastUpdated(new Date())
            }
        } catch (err) {
            console.error('Error fetching SPC scores:', err)
            setError('Gagal memuat data leaderboard')
        } finally {
            if (showLoader) setLoading(false)
            else setIsRefreshing(false)
        }
    }

    const handleManualRefresh = () => fetchScores(false)

    const filteredScores = scores.filter(score =>
        score.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        score.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        score.judulKarya.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />
            case 3:
                return <Award className="h-6 w-6 text-orange-500" />
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>
        }
    }

    const getRankBadge = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
        if (rank <= 6) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
        return 'bg-gray-100 text-gray-700'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-48">
                <div className="flex items-center gap-2">
                    <RefreshCcw className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="text-gray-600">Loading leaderboard...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="text-red-600 mb-4">
                            <strong>Error:</strong> {error}
                        </div>
                        <Button onClick={() => fetchScores()} className="bg-red-600 hover:bg-red-700">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* If finals are configured to be private, show an informational alert so public won't expect final results */}
            {isFinalPrivate && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent>
                        <div className="flex items-start gap-3">
                            <div className="text-yellow-600 mt-0.5">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-yellow-800 mb-1">Final results will be announced later</h3>
                                <p className="text-sm text-yellow-700">Untuk menjaga integritas pengumuman, hasil babak final SPC belum ditampilkan di publik sampai diumumkan resmi.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                                SPC Leaderboard
                            </CardTitle>
                            <CardDescription className="mt-2">Daftar peringkat peserta Scientific Paper Competition</CardDescription>
                        </div>
                        <Button
                            onClick={handleManualRefresh}
                            variant="outline"
                            disabled={isRefreshing}
                            className="gap-2"
                        >
                            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari peserta, institusi, atau judul karya..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {lastUpdated && (
                            <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center justify-end gap-1">
                                    <Clock className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    <span>{lastUpdated.toLocaleString()}</span>
                                    {isRefreshing && (
                                        <span className="text-xs text-blue-600 animate-pulse ml-2">Updating...</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Top 6 Highlight Alert */}
            {filteredScores.some(s => s.isTop6) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">
                            <Award className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-800 mb-1">
                                Top 6 Finalists
                            </h3>
                            <p className="text-sm text-blue-700">
                                Peserta dengan peringkat 1-6 akan melanjutkan ke babak final
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
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
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Penilaian</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Substansi</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kualitas</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredScores.map((score) => (
                                    <tr
                                        key={score.id}
                                        className={`hover:bg-gray-50 transition-colors ${score.isTop6 ? 'bg-blue-50/50' : ''}`}
                                    >
                                        {/* Rank */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getRankIcon(score.rank!)}
                                                <Badge className={getRankBadge(score.rank!)}>
                                                    #{score.rank}
                                                </Badge>
                                                {score.isTop6 && (
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                                        Finalist
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>

                                        {/* Participant Name */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">{score.participantName}</div>
                                        </td>

                                        {/* Institution */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{score.institution}</div>
                                        </td>

                                        {/* Penilaian Score */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="text-lg font-semibold text-purple-600">
                                                {score.avgPenilaian.toFixed(2)}
                                            </div>
                                        </td>

                                        {/* Substansi Score */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="text-lg font-semibold text-indigo-600">
                                                {score.avgSubstansi.toFixed(2)}
                                            </div>
                                        </td>

                                        {/* Kualitas Score */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="text-lg font-semibold text-pink-600">
                                                {score.avgKualitas.toFixed(2)}
                                            </div>
                                        </td>

                                        {/* Total Score */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {score.totalScore.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">Total</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredScores.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data yang sesuai dengan pencarian
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Break Line for Top 6 */}
            {filteredScores.length >= 6 && (
                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-blue-300 w-16"></div>
                        <span className="text-sm font-medium text-blue-600">Top 6 Finalists</span>
                        <div className="h-px bg-blue-300 w-16"></div>
                    </div>
                </div>
            )}
        </div>
    )
}
