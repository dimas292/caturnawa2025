'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award,
  Crown,
  Medal,
  Clock,
  FileText,
  Users
} from 'lucide-react'

interface SPCParticipant {
  rank: number
  teamId: string
  teamName: string
  institution: string
  judulKarya: string
  totalScore: number
  avgPenilaian: number
  avgSubstansi: number
  avgKualitas: number
  judgesCount: number
  status: string
  qualifiedToFinal: boolean
  competition: string
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface SPCTournamentStats {
  totalTeams: number
  averageScore: number
  topPerformers: {
    highestScore: SPCParticipant | null
    mostJudges: SPCParticipant | null
  }
}

interface SPCLeaderboardData {
  competition: {
    type: string
    name: string
  }
  leaderboard: SPCParticipant[]
  statistics: SPCTournamentStats
  generatedAt: string
  accessLevel: string
}

interface SPCLeaderboardProps {
  defaultStage?: string
  hideStageSelector?: boolean
}

export default function SPCLeaderboard({ defaultStage = 'SEMIFINAL', hideStageSelector = false }: SPCLeaderboardProps = {}) {
  const [data, setData] = useState<SPCLeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState(defaultStage)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLeaderboard = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    
    try {
      const params = new URLSearchParams({ competition: 'SPC', stage })
      const response = await fetch(`/api/public/leaderboard?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch SPC leaderboard')
      }
      
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (showLoader) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [stage])

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchLeaderboard(false)
      }, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoRefresh, stage])

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string, qualified: boolean) => {
    if (qualified) {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    switch (status) {
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NOT_QUALIFIED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string, qualified: boolean) => {
    if (qualified) return 'Qualified to Final'
    switch (status) {
      case 'QUALIFIED': return 'Qualified'
      case 'NOT_QUALIFIED': return 'Not Qualified'
      case 'REVIEWED': return 'Reviewed'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="animate-spin mr-2" />
        Loading SPC Leaderboard...
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
          <Button onClick={() => fetchLeaderboard()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 pt-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SPC Scientific Paper Competition Leaderboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!hideStageSelector && (
                <div>
                  <label className="text-sm font-medium">Stage</label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center justify-end gap-1">
                <Clock className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  {lastUpdated ? lastUpdated.toLocaleString() : new Date(data.generatedAt).toLocaleString()}
                </span>
                {isAutoRefresh && (
                  <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                )}
                {isRefreshing && !loading && (
                  <span className="text-xs text-blue-600 animate-pulse">Updating...</span>
                )}
              </div>
              <div className="font-medium">{data.competition.name}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participant Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paper Title</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Judges</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.leaderboard.map((participant) => (
                  <tr key={participant.teamId} className={`hover:bg-gray-50 ${participant.rank <= 6 ? 'bg-blue-50/30' : ''}`}>
                    {/* Rank */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(participant.rank)}
                        <Badge className={getRankBadge(participant.rank)}>
                          #{participant.rank}
                        </Badge>
                      </div>
                    </td>
                    
                    {/* Participant */}
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{participant.teamName}</div>
                    </td>
                    
                    {/* Institution */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{participant.institution}</div>
                    </td>
                    
                    {/* Paper Title */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={participant.judulKarya}>
                        {participant.judulKarya}
                      </div>
                    </td>
                    
                    {/* Total Score */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{participant.totalScore}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </td>
                    
                    {/* Judges */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-lg font-medium">{participant.judgesCount}</div>
                      <div className="text-xs text-gray-500">judges</div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <Badge className={getStatusBadge(participant.status, participant.qualifiedToFinal)}>
                        {getStatusText(participant.status, participant.qualifiedToFinal)}
                      </Badge>
                    </td>
                    
                    {/* Trend */}
                    <td className="px-4 py-4 text-center">
                      {getTrendIcon(participant.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Break Line */}
      {data.leaderboard.length >= 6 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-blue-300 w-16"></div>
            <div className="text-sm text-gray-500 font-medium">Top 6 Qualifiers</div>
            <div className="h-px bg-blue-300 w-16"></div>
          </div>
        </div>
      )}

      {/* Score Breakdown for Top Participants */}
      {data.leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown (Top 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.leaderboard.slice(0, 3).map((participant, index) => (
                <div key={participant.teamId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getRankIcon(participant.rank)}
                    <span className="font-semibold">{participant.teamName}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penilaian:</span>
                      <span className="font-medium">{participant.avgPenilaian || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Substansi:</span>
                      <span className="font-medium">{participant.avgSubstansi || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kualitas:</span>
                      <span className="font-medium">{participant.avgKualitas || 0}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-blue-600">{participant.totalScore || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}