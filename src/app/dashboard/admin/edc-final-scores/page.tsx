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
  ArrowLeft
} from 'lucide-react'

interface TeamData {
  rank: number
  id: string
  teamName: string
  institution: string
  email: string
  members: string[]
  matchesPlayed: number
  teamPoints: number
  speakerPoints: number
  avgPosition: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  fourthPlaces: number
}

export default function EDCFinalScoresPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/edc-final-scores')
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.data)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams.filter(team => 
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.members.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const exportToCSV = () => {
    const headers = ['Rank', 'Team Name', 'Institution', 'Victory Points', 'Speaker Points', 'Avg Position', 'Matches Played', '1st Places', '2nd Places', '3rd Places', '4th Places']
    const rows = filteredTeams.map((team) => [
      team.rank,
      team.teamName,
      team.institution,
      team.teamPoints,
      team.speakerPoints,
      team.avgPosition,
      team.matchesPlayed,
      team.firstPlaces,
      team.secondPlaces,
      team.thirdPlaces,
      team.fourthPlaces
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edc-final-scores-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const stats = {
    totalTeams: teams.length,
    avgTeamPoints: teams.length > 0 
      ? Math.round((teams.reduce((sum, t) => sum + t.teamPoints, 0) / teams.length) * 100) / 100 
      : 0,
    avgSpeakerPoints: teams.length > 0
      ? Math.round((teams.reduce((sum, t) => sum + t.speakerPoints, 0) / teams.length) * 100) / 100
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
          <h1 className="text-3xl font-bold mb-2">Hasil Final EDC</h1>
          <p className="text-gray-600">Leaderboard Final English Debate Competition</p>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Klasemen Final</CardTitle>
              <CardDescription>Peringkat tim berdasarkan performa final</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari tim..."
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
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data klasemen'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Nama Tim</TableHead>
                    <TableHead>Universitas</TableHead>
                    <TableHead className="text-center">Pertandingan</TableHead>
                    <TableHead className="text-right">Victory Points</TableHead>
                    <TableHead className="text-right">Speaker Points</TableHead>
                    <TableHead className="text-right">Avg Position</TableHead>
                    <TableHead className="text-center">🥇</TableHead>
                    <TableHead className="text-center">🥈</TableHead>
                    <TableHead className="text-center">🥉</TableHead>
                    <TableHead className="text-center">4th</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow key={team.id} className={team.rank <= 3 ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}>
                      <TableCell className="font-bold text-lg">
                        {team.rank === 1 && <span className="text-yellow-500">🥇</span>}
                        {team.rank === 2 && <span className="text-gray-400">🥈</span>}
                        {team.rank === 3 && <span className="text-orange-600">🥉</span>}
                        {team.rank > 3 && team.rank}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.teamName}</div>
                          <div className="text-xs text-gray-500">
                            {team.members.join(', ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{team.institution}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{team.matchesPlayed}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-lg text-blue-600">
                          {team.teamPoints}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {team.speakerPoints}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {team.avgPosition}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.firstPlaces > 0 && (
                          <Badge className="bg-yellow-500">{team.firstPlaces}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.secondPlaces > 0 && (
                          <Badge className="bg-gray-400">{team.secondPlaces}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.thirdPlaces > 0 && (
                          <Badge className="bg-orange-600">{team.thirdPlaces}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.fourthPlaces > 0 && (
                          <Badge variant="secondary">{team.fourthPlaces}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
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
