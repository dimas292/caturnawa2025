'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Trophy, Users, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface Participant {
  id: string
  name: string
  role: string
  score: number | null
  judgeScores: (number | null)[]
  judgeIds: (string | null)[]
}

interface Team {
  id: string
  name: string
  institution: string
  position: string
  participants: Participant[]
  teamScore: number
  averageScore: number
  rank: number
  victoryPoints: number
  participantCount: number
  judgeCount: number
}

interface RoomResult {
  roomNumber: number
  matchId: string
  judge: {
    name: string
    email: string
  } | null
  motion: string | null
  teams: Team[]
  isCompleted: boolean
  completedAt: string | null
}

interface RoundInfo {
  roundName: string
  motion: string | null
  stage: string
  roundNumber: number
  competitionName: string
}

interface ApiResponse {
  success: boolean
  round: RoundInfo | null
  roomResults: RoomResult[]
  statistics: {
    totalRooms: number
    totalTeams: number
    completedRooms: number
  }
  generatedAt: string
}

export default function EDCFinalScoresPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/edc-final-scores')

      if (!response.ok) {
        throw new Error('Failed to fetch scores')
      }

      const apiData = await response.json()
      setData(apiData)

      // Expand all rooms by default
      const allRooms = new Set<number>(apiData.roomResults.map((r: RoomResult) => r.roomNumber))
      setExpandedRooms(allRooms)
    } catch (error) {
      console.error('Error fetching scores:', error)
      alert('Gagal memuat data nilai final EDC')
    } finally {
      setLoading(false)
    }
  }

  const toggleRoom = (roomNumber: number) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomNumber)) {
        newSet.delete(roomNumber)
      } else {
        newSet.add(roomNumber)
      }
      return newSet
    })
  }

  const exportToCSV = () => {
    if (!data) return

    // Determine max judge count
    const maxJudgeCount = Math.max(...data.roomResults.flatMap(r =>
      r.teams.map(t => t.judgeCount || 0)
    ), 0)

    const headers = ['Room', 'Team', 'Institution', 'Position', 'Participant', 'Role']
    for (let i = 1; i <= maxJudgeCount; i++) {
      headers.push(`Juri ${i}`)
    }
    headers.push('Total Score', 'Team Score', 'Rank', 'Victory Points')

    const rows: string[][] = []
    data.roomResults.forEach(room => {
      room.teams.forEach(team => {
        team.participants.forEach(participant => {
          const row = [
            `Room ${room.roomNumber}`,
            team.name,
            team.institution,
            team.position,
            participant.name,
            formatRoleLabel(participant.role)
          ]

          // Add judge scores
          if (participant.judgeScores) {
            participant.judgeScores.forEach(score => {
              row.push(score !== null ? score.toString() : '-')
            })
            // Fill remaining judge columns if this participant has fewer judges
            for (let i = participant.judgeScores.length; i < maxJudgeCount; i++) {
              row.push('-')
            }
          } else {
            for (let i = 0; i < maxJudgeCount; i++) {
              row.push('-')
            }
          }

          row.push(
            participant.score?.toString() || '-',
            team.teamScore.toString(),
            team.rank.toString(),
            team.victoryPoints.toString()
          )

          rows.push(row)
        })
      })
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `edc-final-scores-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('Data berhasil diekspor ke CSV')
  }

  const getPositionColor = (position: string) => {
    if (position.includes('OG')) return 'border-green-500'
    if (position.includes('OO')) return 'border-red-500'
    if (position.includes('CG')) return 'border-blue-500'
    if (position.includes('CO')) return 'border-orange-500'
    return 'border-gray-300'
  }

  const getPositionBadge = (position: string) => {
    if (position.includes('OG')) return <Badge className="bg-green-500 hover:bg-green-600">OG</Badge>
    if (position.includes('OO')) return <Badge className="bg-red-500 hover:bg-red-600">OO</Badge>
    if (position.includes('CG')) return <Badge className="bg-blue-500 hover:bg-blue-600">CG</Badge>
    if (position.includes('CO')) return <Badge className="bg-orange-500 hover:bg-orange-600">CO</Badge>
    return <Badge variant="outline">{position}</Badge>
  }

  const formatRoleLabel = (role: string) => {
    if (!role) return role
    const r = role.toString().trim().toLowerCase()
    // Exact mapping for expected values
    if (r === 'leader') return 'Speaker 1'
    if (r === 'member') return 'Speaker 2'
    // preserve any existing speaker label
    if (r.startsWith('speaker')) return role
    return role
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3rd</Badge>
    if (rank === 4) return <Badge variant="outline">4th</Badge>
    return <Badge variant="outline">{rank}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data nilai final EDC...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Data tidak tersedia</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">EDC Final Scores</h1>
        <p className="text-muted-foreground">
          {data.round?.competitionName} - {data.round?.roundName}
        </p>
        {data.round?.motion && (
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Motion:</strong> {data.round.motion}
          </p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.totalRooms}</div>
            <p className="text-xs text-muted-foreground">Completed final rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.totalTeams}</div>
            <p className="text-xs text-muted-foreground">Teams in final stage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Data</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <Button onClick={exportToCSV} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Room Results */}
      <div className="space-y-4">
        {data.roomResults.map((room) => (
          <Card key={room.roomNumber}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Room {room.roomNumber}
                    {room.isCompleted && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {room.judge ? `Judge: ${room.judge.name}` : 'No judge assigned'}
                    {room.completedAt && ` • Completed: ${new Date(room.completedAt).toLocaleString('id-ID')}`}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRoom(room.roomNumber)}
                >
                  {expandedRooms.has(room.roomNumber) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedRooms.has(room.roomNumber) && (
              <CardContent className="space-y-4">
                {room.teams.map((team) => (
                  <Card key={team.id} className={`border-l-4 ${getPositionColor(team.position)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getPositionBadge(team.position)}
                            {team.name}
                          </CardTitle>
                          <CardDescription>{team.institution}</CardDescription>
                        </div>
                        <div className="text-right">
                          {getRankBadge(team.rank)}
                          <p className="text-sm text-muted-foreground mt-1">
                            VP: {team.victoryPoints}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Participant</TableHead>
                            <TableHead>Role</TableHead>
                            {team.judgeCount > 0 && team.participants[0]?.judgeScores && (
                              <>
                                {team.participants[0].judgeScores.map((_, idx) => (
                                  <TableHead key={idx} className="text-center">
                                    Juri {idx + 1}
                                  </TableHead>
                                ))}
                              </>
                            )}
                            <TableHead className="text-center font-bold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {team.participants.map((participant) => (
                            <TableRow key={participant.id}>
                              <TableCell className="font-medium">{participant.name}</TableCell>
                              <TableCell>{formatRoleLabel(participant.role)}</TableCell>
                              {participant.judgeScores && participant.judgeScores.map((judgeScore, idx) => (
                                <TableCell key={idx} className="text-center">
                                  {judgeScore !== null ? judgeScore.toFixed(1) : '-'}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-bold">
                                {participant.score !== null ? participant.score.toFixed(1) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={2 + (team.judgeCount || 0)} className="font-bold">Team Total</TableCell>
                            <TableCell className="text-center font-bold text-lg">
                              {team.teamScore.toFixed(1)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2 + (team.judgeCount || 0)} className="font-medium">Average Score</TableCell>
                            <TableCell className="text-center font-medium">
                              {team.averageScore.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {data.roomResults.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Belum ada data nilai final yang tersedia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
