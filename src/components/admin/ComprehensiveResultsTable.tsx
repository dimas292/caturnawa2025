'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCcw, Eye, EyeOff, Trophy, Users, BarChart3 } from 'lucide-react'

interface Speaker {
  name: string
  role: string
  score: number
}

interface Team {
  id: string
  name: string
  position: string
  speakers: Speaker[]
  teamScore: number
  rank: number
  victoryPoints: number
}

interface Judge {
  id: string
  name: string
  role: string
}

interface RoomResult {
  roomNumber: number
  judges: Judge[]
  teams: Team[]
  isCompleted: boolean
  completedAt: string | null
}

interface ComprehensiveResults {
  round: {
    id: string
    stage: string
    roundNumber: number
    roundName: string
    motion: string
    competitionName: string
    isFrozen: boolean
  }
  roomResults: RoomResult[]
  statistics: {
    totalRooms: number
    totalTeams: number
    averageTeamScore: number
    scoreRange: { min: number; max: number }
    bestPerformingTeams: Array<{ roomNumber: number; team: Team }>
    highestIndividualScores: Speaker[]
    victoryPointsDistribution: {
      first: number
      second: number
      third: number
      fourth: number
    }
  }
  generatedAt: string
}

export default function ComprehensiveResultsTable() {
  const [data, setData] = useState<ComprehensiveResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [competition, setCompetition] = useState('KDBI')
  const [stage, setStage] = useState('PRELIMINARY')
  const [round, setRound] = useState('1')
  const [includeFrozen, setIncludeFrozen] = useState(false)

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        competition,
        stage,
        round,
        includeFrozen: includeFrozen.toString()
      })
      
      const response = await fetch(`/api/admin/comprehensive-results?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch results')
      }
      
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [competition, stage, round, includeFrozen])

  const getRankDisplay = (rank: number) => {
    const displays = {
      1: { emoji: '🥇', text: '1st', class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      2: { emoji: '🥈', text: '2nd', class: 'bg-gray-100 text-gray-800 border-gray-300' },
      3: { emoji: '🥉', text: '3rd', class: 'bg-orange-100 text-orange-800 border-orange-300' },
      4: { emoji: '', text: '4th', class: 'bg-slate-100 text-slate-800 border-slate-300' }
    }
    return displays[rank as keyof typeof displays] || displays[4]
  }

  const getPositionColor = (position: string) => {
    if (position.includes('Opening Government')) return 'border-l-4 border-green-500'
    if (position.includes('Opening Opposition')) return 'border-l-4 border-red-500'
    if (position.includes('Closing Government')) return 'border-l-4 border-blue-500'
    if (position.includes('Closing Opposition')) return 'border-l-4 border-orange-500'
    return ''
  }

  const getPositionShort = (position: string) => {
    if (position.includes('Opening Government')) return '🟢 OG'
    if (position.includes('Opening Opposition')) return '🔴 OO'
    if (position.includes('Closing Government')) return '🔵 CG'
    if (position.includes('Closing Opposition')) return '🟠 CO'
    return position
  }

  const exportResults = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="animate-spin mr-2" />
        Loading comprehensive results...
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
          <Button onClick={fetchResults} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Comprehensive Tournament Results
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIncludeFrozen(!includeFrozen)}
              >
                {includeFrozen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {includeFrozen ? 'Hide Frozen' : 'Show Frozen'}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchResults}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Competition</label>
              <Select value={competition} onValueChange={setCompetition}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KDBI">KDBI</SelectItem>
                  <SelectItem value="EDC">EDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Stage</label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                  <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Round</label>
              <Select value={round} onValueChange={setRound}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => exportResults('pdf')}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportResults('excel')}>
                Excel
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportResults('csv')}>
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{data.round.competitionName} - {data.round.roundName}</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>🎯 <strong>Motion:</strong> "{data.round.motion}"</span>
              {data.round.isFrozen && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ❄️ Frozen Round
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500">
              📅 Generated: {new Date(data.generatedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Results */}
      <div className="space-y-6">
        {data.roomResults.map((room) => (
          <Card key={room.roomNumber} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  🏠 Room {room.roomNumber}
                  {!room.isCompleted && (
                    <Badge variant="outline" className="text-orange-600">
                      In Progress
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {room.judges.map((judge, idx) => (
                    <span key={judge.id}>
                      {judge.role}: <strong>{judge.name}</strong>
                      {idx < room.judges.length - 1 && ' | '}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Individual</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {room.teams.map((team, teamIdx) => (
                      <React.Fragment key={team.id}>
                        {team.speakers.map((speaker, speakerIdx) => {
                          const isFirstSpeaker = speakerIdx === 0
                          const rankDisplay = getRankDisplay(team.rank)
                          
                          return (
                            <tr key={`${team.id}-${speaker.role}`} className={getPositionColor(team.position)}>
                              {isFirstSpeaker && (
                                <>
                                  <td rowSpan={team.speakers.length} className="px-4 py-3 font-medium">
                                    {getPositionShort(team.position)}
                                  </td>
                                  <td rowSpan={team.speakers.length} className="px-4 py-3 font-medium">
                                    {team.name}
                                  </td>
                                </>
                              )}
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{speaker.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {speaker.role}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center font-mono">
                                {speaker.score?.toFixed(1) || '-'}
                              </td>
                              {isFirstSpeaker && (
                                <>
                                  <td rowSpan={team.speakers.length} className="px-4 py-3 text-center font-mono font-bold">
                                    {team.teamScore.toFixed(1)}
                                  </td>
                                  <td rowSpan={team.speakers.length} className="px-4 py-3">
                                    <Badge className={rankDisplay.class}>
                                      {rankDisplay.emoji} {rankDisplay.text}
                                    </Badge>
                                  </td>
                                  <td rowSpan={team.speakers.length} className="px-4 py-3 text-center font-bold text-lg">
                                    {team.victoryPoints}
                                  </td>
                                </>
                              )}
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Round Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.statistics.totalRooms}</div>
              <div className="text-sm text-gray-500">Total Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.statistics.totalTeams}</div>
              <div className="text-sm text-gray-500">Total Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.statistics.averageTeamScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.statistics.scoreRange.min} - {data.statistics.scoreRange.max}
              </div>
              <div className="text-sm text-gray-500">Score Range</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">🏆 Best Performing Teams by Room:</h4>
              <div className="grid gap-2">
                {data.statistics.bestPerformingTeams.map(({ roomNumber, team }) => (
                  <div key={roomNumber} className="text-sm">
                    <strong>Room {roomNumber}:</strong> {team.name} ({team.teamScore.toFixed(1)} pts)
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎯 Highest Individual Scores:</h4>
              <div className="space-y-1">
                {data.statistics.highestIndividualScores.slice(0, 3).map((speaker, idx) => (
                  <div key={idx} className="text-sm">
                    {idx + 1}. {speaker.name} ({speaker.role}) - {speaker.score.toFixed(1)} points
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎪 Victory Points Distribution:</h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>🥇 1st: {data.statistics.victoryPointsDistribution.first}</div>
                <div>🥈 2nd: {data.statistics.victoryPointsDistribution.second}</div>
                <div>🥉 3rd: {data.statistics.victoryPointsDistribution.third}</div>
                <div>4th: {data.statistics.victoryPointsDistribution.fourth}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}