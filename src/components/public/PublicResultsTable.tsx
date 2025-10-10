'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCcw, Users, BarChart3, Trophy, Clock, CheckCircle } from 'lucide-react'

interface Participant {
  id: string
  name: string
  role: string
  position: number
  score: number | null
}

interface PublicTeam {
  id: string
  name: string
  position: string
  teamScore: number | null
  averageScore: number | null
  rank: number | null
  victoryPoints: number | null
  participantCount: number
  participants: Participant[]
}

interface PublicRoomResult {
  roomNumber: number
  teams: PublicTeam[]
  isCompleted: boolean
  completedAt: string | null
}

interface PublicResults {
  round: {
    id: string
    stage: string
    roundNumber: number
    roundName: string
    motion: string
    competitionName: string
    isFrozen: boolean
  }
  roomResults: PublicRoomResult[]
  statistics: {
    totalRooms: number
    totalTeams: number
    completedRooms: number
    victoryPointsDistribution: {
      first: number
      second: number
      third: number
      fourth: number
    }
  }
  generatedAt: string
  accessLevel: string
}

export default function PublicResultsTable() {
  const [data, setData] = useState<PublicResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [competition, setCompetition] = useState('KDBI')
  const [stage, setStage] = useState('PRELIMINARY')
  const [round, setRound] = useState('1')

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        competition,
        stage,
        round
      })
      
      const response = await fetch(`/api/public/comprehensive-results?${params}`)
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
  }, [competition, stage, round])

  const getRankDisplay = (rank: number | null) => {
    if (rank === null) return { emoji: '', text: 'TBD', class: 'bg-gray-100 text-gray-500' }
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="animate-spin mr-2 h-4 w-4" />
        <span>Loading tournament results...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="text-destructive">
            {error === 'Round results are currently frozen' ? (
              <div className="text-center space-y-4">
                <div className="text-6xl">❄️</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Results Temporarily Hidden</h3>
                  <p className="text-sm text-muted-foreground">This round's results are frozen and will be revealed soon.</p>
                </div>
              </div>
            ) : (
              <div>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
          <Button onClick={fetchResults} className="mt-4">
            <RefreshCcw className="h-4 w-4 mr-2" />
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
              Tournament Results
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchResults}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Round Info */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{data.round.competitionName} - {data.round.roundName}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Motion:</strong> "{data.round.motion}"
                </p>
              </div>
              <div className="flex items-center gap-2">
                {data.round.isFrozen && (
                  <Badge variant="secondary">
                    ❄️ Frozen
                  </Badge>
                )}
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(data.generatedAt).toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Results - One Card Per Room */}
      <div className="space-y-4">
        {data.roomResults.map((room) => (
          <Card key={room.roomNumber}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Room {room.roomNumber}
                </CardTitle>
                <Badge variant={room.isCompleted ? "default" : "outline"} className={room.isCompleted ? "bg-green-100 text-green-800 text-xs" : "text-orange-600 text-xs"}>
                  {room.isCompleted ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Live
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-16 text-xs font-medium text-muted-foreground h-8">Pos</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground h-8">Team Name</TableHead>
                    <TableHead className="w-32 text-center text-xs font-medium text-muted-foreground h-8">Individual Scores</TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium text-muted-foreground h-8">Team Score</TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium text-muted-foreground h-8">Avg Score</TableHead>
                    <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground h-8">Rank</TableHead>
                    <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground h-8">VP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {room.teams.map((team) => {
                    const rankDisplay = getRankDisplay(team.rank)
                    
                    return (
                      <TableRow key={team.id} className={`${getPositionColor(team.position)} hover:bg-muted/50`}>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {getPositionShort(team.position)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm py-2">
                          {team.name}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <div className="space-y-1">
                            {team.participants.map((participant) => (
                              <div key={participant.id} className="text-xs">
                                <span className="font-medium text-gray-700">{participant.name}:</span>
                                <span className="font-mono ml-1">
                                  {participant.score !== null ? participant.score.toFixed(1) : '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm py-2">
                          {team.teamScore !== null ? team.teamScore.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm py-2">
                          {team.averageScore !== null ? team.averageScore.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <Badge variant="outline" className={`${rankDisplay.class} text-xs px-1 py-0`}>
                            {rankDisplay.emoji} {rankDisplay.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-sm py-2">
                          {team.victoryPoints !== null ? team.victoryPoints : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}