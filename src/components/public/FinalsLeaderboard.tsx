'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, Award, Crown, RefreshCcw, Users, Star } from 'lucide-react'

interface Winner {
  competitionType: string
  competitionName: string
  participantName: string
  institution: string
  title: string
  totalScore: number
  judgesCount?: number
  teamPoints?: number
  speakerPoints?: number
  matchesPlayed?: number
  category: string
}

interface LeaderboardData {
  allWinners: Winner[]
  byCompetition: {
    SPC: Winner[]
    DCC_INFOGRAFIS: Winner[]
    DCC_SHORT_VIDEO: Winner[]
    KDBI: Winner[]
    EDC: Winner[]
  }
  statistics: {
    totalCompetitions: number
    totalWinners: number
  }
}

export default function FinalsLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/leaderboard/finals')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
    return 'bg-gray-100 text-gray-700'
  }

  const renderWinnerCard = (winner: Winner, rank: number) => {
    const isDebate = winner.competitionType === 'KDBI' || winner.competitionType === 'EDC'
    
    return (
      <Card key={`${winner.competitionType}-${winner.participantName}-${rank}`} 
            className={`border-l-4 ${
              rank === 1 ? 'border-l-yellow-500' : 
              rank === 2 ? 'border-l-gray-400' : 
              rank === 3 ? 'border-l-orange-500' : 
              'border-l-blue-500'
            }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadge(rank)}`}>
                {getRankIcon(rank)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{winner.participantName}</h3>
                    <p className="text-sm text-gray-600">{winner.institution}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {winner.competitionName}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 italic">{winner.title}</p>
                
                <div className="flex gap-4 text-sm">
                  {isDebate ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{winner.teamPoints} VP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{winner.speakerPoints?.toFixed(1)} SP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{winner.matchesPlayed} matches</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{winner.totalScore.toFixed(2)} pts</span>
                      </div>
                      {winner.judgesCount && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{winner.judgesCount} juri</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCcw className="animate-spin mr-2" />
        Memuat data pemenang...
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">
            <strong>Error:</strong> {error || 'Data tidak tersedia'}
          </div>
          <Button onClick={fetchData} className="mt-4">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Pemenang Final UNAS FEST 2025
            </CardTitle>
          </div>
          <CardDescription>
            Selamat kepada para pemenang dari seluruh kompetisi!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">Total Kompetisi: {data.statistics.totalCompetitions}</div>
                <div className="text-gray-500">Total Pemenang: {data.statistics.totalWinners}</div>
              </div>
            </div>
            
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs untuk setiap kompetisi */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Kompetisi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="spc">SPC</TabsTrigger>
              <TabsTrigger value="dcc-info">DCC Info</TabsTrigger>
              <TabsTrigger value="dcc-video">DCC Video</TabsTrigger>
              <TabsTrigger value="kdbi">KDBI</TabsTrigger>
              <TabsTrigger value="edc">EDC</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              <h2 className="text-2xl font-bold mb-4">Semua Pemenang</h2>
              
              {data.byCompetition.SPC.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-blue-600">Scientific Paper Competition</h3>
                  {data.byCompetition.SPC.slice(0, 3).map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              )}

              {data.byCompetition.DCC_INFOGRAFIS.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-purple-600">DCC - Infografis</h3>
                  {data.byCompetition.DCC_INFOGRAFIS.slice(0, 3).map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              )}

              {data.byCompetition.DCC_SHORT_VIDEO.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-pink-600">DCC - Short Video</h3>
                  {data.byCompetition.DCC_SHORT_VIDEO.slice(0, 3).map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              )}

              {data.byCompetition.KDBI.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-green-600">KDBI - Kompetisi Debat Bahasa Indonesia</h3>
                  {data.byCompetition.KDBI.slice(0, 3).map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              )}

              {data.byCompetition.EDC.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-orange-600">EDC - English Debate Competition</h3>
                  {data.byCompetition.EDC.slice(0, 3).map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="spc" className="space-y-4 mt-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Scientific Paper Competition</h2>
                <p className="text-gray-600 mb-4">Pemenang berdasarkan penilaian presentasi dari panel juri</p>
              </div>
              {data.byCompetition.SPC.length > 0 ? (
                <div className="space-y-3">
                  {data.byCompetition.SPC.map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Belum ada data pemenang SPC
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="dcc-info" className="space-y-4 mt-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">DCC - Infografis</h2>
                <p className="text-gray-600 mb-4">Pemenang Digital Creative Competition kategori Infografis</p>
              </div>
              {data.byCompetition.DCC_INFOGRAFIS.length > 0 ? (
                <div className="space-y-3">
                  {data.byCompetition.DCC_INFOGRAFIS.map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Belum ada data pemenang DCC Infografis
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="dcc-video" className="space-y-4 mt-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">DCC - Short Video</h2>
                <p className="text-gray-600 mb-4">Pemenang Digital Creative Competition kategori Short Video</p>
              </div>
              {data.byCompetition.DCC_SHORT_VIDEO.length > 0 ? (
                <div className="space-y-3">
                  {data.byCompetition.DCC_SHORT_VIDEO.map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Belum ada data pemenang DCC Short Video
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="kdbi" className="space-y-4 mt-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">KDBI - Kompetisi Debat Bahasa Indonesia</h2>
                <p className="text-gray-600 mb-4">Pemenang berdasarkan Victory Points & Speaker Points</p>
              </div>
              {data.byCompetition.KDBI.length > 0 ? (
                <div className="space-y-3">
                  {data.byCompetition.KDBI.map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Belum ada data pemenang KDBI
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="edc" className="space-y-4 mt-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">EDC - English Debate Competition</h2>
                <p className="text-gray-600 mb-4">Pemenang berdasarkan Victory Points & Speaker Points</p>
              </div>
              {data.byCompetition.EDC.length > 0 ? (
                <div className="space-y-3">
                  {data.byCompetition.EDC.map((winner, index) => renderWinnerCard(winner, index + 1))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Belum ada data pemenang EDC
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
