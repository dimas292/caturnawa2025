'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Award,
  Crown,
  Medal,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { da } from 'date-fns/locale'

interface TeamMember {
  name: string
  role: string
  position: number
}

interface LeaderboardTeam {
  rank: number
  teamId: string
  teamName: string
  institution: string
  teamPoints: number
  speakerPoints: number
  averageSpeakerPoints: number
  matchesPlayed: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  fourthPlaces: number
  avgPosition: number
  members: TeamMember[]
  competition: string
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface TournamentStats {
  totalTeams: number
  totalMatches: number
  averageTeamPoints: number
  averageSpeakerPoints: number
  frozenRoundsInfo: {
    count: number
    rounds: string[]
    message: string
    details?: Array<{
      roundName: string
      stage: string
      roundNumber: number
      session: number
    }>
  } | null
  topPerformers: {
    highestTeamPoints: LeaderboardTeam | null
    highestSpeakerAverage: LeaderboardTeam | null
    mostConsistent: LeaderboardTeam | null
  }
}

interface LeaderboardData {
  competition: {
    type: string
    name: string
  }
  leaderboard: LeaderboardTeam[]
  statistics: TournamentStats
  frozenRoundsActive: boolean
  generatedAt: string
  accessLevel: string
}

interface GlobalLeaderboardProps {
  defaultCompetition?: string
  hideCompetitionSelector?: boolean
}

export default function GlobalLeaderboard({ defaultCompetition = 'KDBI', hideCompetitionSelector = false }: GlobalLeaderboardProps = {}) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [competition, setCompetition] = useState(defaultCompetition)
  const [stage, setStage] = useState('PRELIMINARY')
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
      // Special handling for KDBI FINAL stage
      if (competition === 'KDBI' && stage === 'FINAL') {
        const response = await fetch('/api/leaderboard/kdbi-final-scores', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch KDBI FINAL leaderboard')
        }

        // Adapt KDBI final scores data to LeaderboardData format
        const adaptedLeaderboard = result.roomResults
          .flatMap((room: any) => 
            room.teams.map((team: any) => ({
              rank: team.rank,
              teamId: team.id,
              teamName: team.name,
              institution: team.institution,
              teamPoints: team.victoryPoints,
              speakerPoints: team.teamScore,
              averageSpeakerPoints: team.averageScore,
              matchesPlayed: 1,
              firstPlaces: team.rank === 1 ? 1 : 0,
              secondPlaces: team.rank === 2 ? 1 : 0,
              thirdPlaces: team.rank === 3 ? 1 : 0,
              fourthPlaces: team.rank === 4 ? 1 : 0,
              avgPosition: team.rank,
              members: team.participants.map((p: any, idx: number) => ({
                name: p.name,
                role: p.role,
                position: idx + 1
              })),
              competition: 'KDBI',
              trend: 'stable' as const,
              lastUpdated: result.generatedAt
            }))
          )
          // Sort by Victory Points (descending), then by team score, then by average score
          .sort((a: any, b: any) => {
            if (b.teamPoints !== a.teamPoints) return b.teamPoints - a.teamPoints
            if (b.speakerPoints !== a.speakerPoints) return b.speakerPoints - a.speakerPoints
            return b.averageSpeakerPoints - a.averageSpeakerPoints
          })
          // Re-assign ranks after sorting
          .map((team: any, index: number) => ({
            ...team,
            rank: index + 1
          }))

        setData({
          competition: {
            type: 'KDBI',
            name: 'KDBI - Kompetisi Debat Bahasa Indonesia'
          },
          leaderboard: adaptedLeaderboard,
          statistics: {
            totalTeams: result.statistics.totalTeams,
            totalMatches: result.statistics.totalRooms,
            averageTeamPoints: 0,
            averageSpeakerPoints: 0,
            frozenRoundsInfo: null,
            topPerformers: {
              highestTeamPoints: null,
              highestSpeakerAverage: null,
              mostConsistent: null
            }
          },
          frozenRoundsActive: false,
          generatedAt: result.generatedAt,
          accessLevel: 'public'
        })
        setLastUpdated(new Date(result.generatedAt))
      } else {
        // Normal leaderboard for other stages
        const params = new URLSearchParams({ competition, stage })
        const response = await fetch(`/api/public/leaderboard?${params}`, {
          cache: 'no-store', // Always get fresh data
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch leaderboard')
        }

        setData(result)
        setLastUpdated(new Date())
      }
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
  }, [competition, stage])

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchLeaderboard(false) // Silent refresh without loader
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoRefresh, competition, stage])

  // Click handlers
  const handleManualRefresh = () => fetchLeaderboard()
  const toggleAutoRefresh = () => setIsAutoRefresh(!isAutoRefresh)

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
    if (rank <= 8) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
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

  const getPositionBreakdown = (team: LeaderboardTeam) => {
    return [
      { place: '1st', count: team.firstPlaces, color: 'text-yellow-600' },
      { place: '2nd', count: team.secondPlaces, color: 'text-gray-600' },
      { place: '3rd', count: team.thirdPlaces, color: 'text-orange-600' },
      { place: '4th', count: team.fourthPlaces, color: 'text-red-600' }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="animate-spin mr-2" />
        Loading leaderboard...
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
            <CardDescription className="flex items-center gap-2">
              Daftar Peringkat Peserta {data.competition.name}
            </CardDescription>

          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!hideCompetitionSelector && (
                <div>
                  <label className="text-sm font-medium">Competition</label>
                  <Select value={competition} onValueChange={setCompetition}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KDBI">KDBI</SelectItem>
                      <SelectItem value="EDC">EDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Stage</label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                    <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* <div className="text-right text-sm text-gray-500">
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
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Frozen Rounds Alert */}
      {data.frozenRoundsActive && data.statistics.frozenRoundsInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">
                  ❄️ Some rounds are currently frozen
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {data.statistics.frozenRoundsInfo.message}
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Frozen rounds: {data.statistics.frozenRoundsInfo.rounds.join(', ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Team Points</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rata-Rata</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Matches</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Positions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.leaderboard.map((team) => (
                  <tr key={team.teamId} className={`hover:bg-gray-50 ${team.rank <= 8 ? 'bg-blue-50/30' : ''}`}>
                    {/* Rank */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(team.rank)}
                        <Badge className={getRankBadge(team.rank)}>
                          #{team.rank}
                        </Badge>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{team.teamName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {team.members.length} members
                        </div>
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{team.institution}</div>
                    </td>

                    {/* Team Points */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{team.teamPoints}</div>
                      <div className="text-xs text-gray-500">VP</div>
                    </td>

                    {/* Average Speaker */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {team.averageSpeakerPoints.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({team.speakerPoints.toFixed(0)} total)
                      </div>
                    </td>

                    {/* Matches Played */}
                    <td className="px-4 py-4 text-center">
                      <div className="text-lg font-medium">{team.matchesPlayed}</div>
                      <div className="text-xs text-gray-500">rounds</div>
                    </td>

                    {/* Position Breakdown */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {getPositionBreakdown(team).map((pos) => (
                          <div key={pos.place} className="text-center">
                            <div className={`text-xs font-bold ${pos.color}`}>{pos.count}</div>
                            <div className="text-xs text-gray-400">{pos.place}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        Avg: {team.avgPosition.toFixed(1)}
                      </div>
                    </td>

                    {/* Trend */}
                    <td className="px-4 py-4 text-center">
                      {getTrendIcon(team.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Break Line */}
      {data.leaderboard.length >= 8 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-blue-300 w-16"></div>

            <div className="h-px bg-blue-300 w-16"></div>
          </div>
        </div>
      )}

      {/* Footer */}

    </div>
  )
}