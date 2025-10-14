"use client"

import { useState, useEffect, useCallback } from "react"
import { useRequireRoles } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoadingPage } from "@/components/ui/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ui/mode-toggle"
import BPScoringForm from "@/components/judge/bp-scoring-form"
import {
  ArrowLeft,
  AlertCircle,
  Bell
} from "lucide-react"

interface Team {
  id: string
  teamName: string
  members: Array<{
    fullName: string
    participant: { fullName: string }
  }>
}

interface Match {
  id: string
  matchNumber: number
  roundName: string
  stage: string
  judge?: {
    id: string
    name: string
    email: string
  } | null
  team1?: Team
  team2?: Team
  team3?: Team
  team4?: Team
  hasScored: boolean
  isCompleted: boolean
  scheduledAt?: string
  completedAt?: string
}

export default function EDCJudgePage() {
  // Auth & Navigation
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const router = useRouter()
  
  // Filter States
  const [selectedStage, setSelectedStage] = useState("PRELIMINARY")
  const [roundSession, setRoundSession] = useState("1-1") // Format: "round-session"
  
  // Data States
  const [matches, setMatches] = useState<Match[]>([])
  const [isMatchesLoading, setIsMatchesLoading] = useState(false)
  
  // Scoring Dialog States
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isScoringDialogOpen, setIsScoringDialogOpen] = useState(false)

  const fetchMatches = useCallback(async () => {
    setIsMatchesLoading(true)
    try {
      const [round, session] = roundSession.split('-').map(Number)
      const sessionParam = selectedStage === 'PRELIMINARY' ? `&session=${session}` : ''
      const response = await fetch(
        `/api/judge/matches?stage=${selectedStage}&round=${round}&competition=EDC${sessionParam}`
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch EDC matches:', { status: response.status, errorData })
        setMatches([])
        return
      }
      
      const data = await response.json()
      console.log('Fetched matches with judge data:', data.matches)
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setMatches([])
    } finally {
      setIsMatchesLoading(false)
    }
  }, [selectedStage, roundSession])

  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user, fetchMatches])

  const handleScoreSubmit = async (scores: any) => {
    if (!selectedMatch) return
    
    try {
      // Transform scores to new API format (participantId, score)
      const scoresArray: { participantId: string; score: number }[] = []
      const teams = [selectedMatch.team1, selectedMatch.team2, selectedMatch.team3, selectedMatch.team4]
      
      for (let teamIndex = 0; teamIndex < 4; teamIndex++) {
        const team = teams[teamIndex]
        if (team && scores.teams[teamIndex]) {
          const teamMembers = team.members.slice(0, 2)
          teamMembers.forEach((member: any, speakerIndex: number) => {
            const participantId = member.participantId || member.participant?.id
            if (participantId) {
              scoresArray.push({
                participantId: participantId,
                score: scores.teams[teamIndex].speakers[speakerIndex]
              })
            }
          })
        }
      }

      console.log('Submitting scores:', { matchId: selectedMatch.id, count: scoresArray.length })

      const response = await fetch('/api/judge/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          scores: scoresArray,
          markAsCompleted: true
        })
      })
      
      if (response.ok) {
        setIsScoringDialogOpen(false)
        setSelectedMatch(null)
        await fetchMatches()
        alert('✅ Scores submitted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting scores:', error)
      alert('Error submitting scores')
    }
  }

  const openScoringDialog = (match: Match) => {
    setSelectedMatch(match)
    setIsScoringDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingPage />
  }

  // Computed Values
  const [round, session] = roundSession.split('-').map(Number)
  
  const stats = {
    totalMatches: matches.length,
    activeMatches: matches.filter(m => !m.isCompleted).length,
    pendingReviews: matches.filter(m => !m.hasScored).length,
    completedScores: matches.filter(m => m.hasScored).length,
  }

  // Helper Functions
  const getRoundSessionOptions = () => {
    switch (selectedStage) {
      case 'PRELIMINARY': 
        return [
          { value: '1-1', label: 'Round 1 Sesi 1' },
          { value: '1-2', label: 'Round 1 Sesi 2' },
          { value: '2-1', label: 'Round 2 Sesi 1' },
          { value: '2-2', label: 'Round 2 Sesi 2' },
          { value: '3-1', label: 'Round 3 Sesi 1' },
          { value: '3-2', label: 'Round 3 Sesi 2' },
          { value: '4-1', label: 'Round 4 Sesi 1' },
          { value: '4-2', label: 'Round 4 Sesi 2' },
        ]
      case 'SEMIFINAL':
        return [
          { value: '1-1', label: 'Round 1' },
          { value: '2-1', label: 'Round 2' },
        ]
      case 'FINAL':
        return [
          { value: '1-1', label: 'Round 1' },
          { value: '2-1', label: 'Round 2' },
          { value: '3-1', label: 'Round 3' },
        ]
      default: 
        return [{ value: '1-1', label: 'Round 1' }]
    }
  }

  const getStatusBadge = (match: Match) => {
    if (match.hasScored) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sudah Dinilai</Badge>
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Menunggu</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/judge')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold pt-6">EDC Scoring Dashboard</h1>
        </div>

        {/* Stage & Round Selection with Tabs */}
        <Tabs value={selectedStage} onValueChange={(value) => {
          setSelectedStage(value)
          setRoundSession("1-1")
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PRELIMINARY">Preliminary</TabsTrigger>
            <TabsTrigger value="SEMIFINAL">Semifinal</TabsTrigger>
            <TabsTrigger value="FINAL">Final</TabsTrigger>
          </TabsList>

          <TabsContent value="PRELIMINARY" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preliminary Rounds</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {getRoundSessionOptions().map(option => (
                    <Button
                      key={option.value}
                      variant={roundSession === option.value ? "default" : "outline"}
                      onClick={() => setRoundSession(option.value)}
                      size="sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="SEMIFINAL" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Semifinal Rounds</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {getRoundSessionOptions().map(option => (
                    <Button
                      key={option.value}
                      variant={roundSession === option.value ? "default" : "outline"}
                      onClick={() => setRoundSession(option.value)}
                      size="sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="FINAL" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Rounds</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {getRoundSessionOptions().map(option => (
                    <Button
                      key={option.value}
                      variant={roundSession === option.value ? "default" : "outline"}
                      onClick={() => setRoundSession(option.value)}
                      size="sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats - Simplified */}
        {matches.length > 0 && (
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{stats.totalMatches}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pending: </span>
              <span className="font-semibold text-yellow-600">{stats.pendingReviews}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Completed: </span>
              <span className="font-semibold text-green-600">{stats.completedScores}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isMatchesLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading matches...</p>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Matches List */}
        {!isMatchesLoading && matches.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No matches found for this stage and round.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact admin to set up matches or select a different stage/round.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

        {!isMatchesLoading && matches.length > 0 && (
        <div className="space-y-4">
          
          {matches.map(match => {
            const teams = [match.team1, match.team2, match.team3, match.team4].filter(Boolean)
            const hasAllTeams = teams.length === 4

            return (
              <Card key={match.id} className={match.hasScored ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Room {match.matchNumber}
                        {match.judge && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            • Judge: {match.judge.name || match.judge.email}
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(match)}
                      {hasAllTeams && (
                        <Button
                          onClick={() => openScoringDialog(match)}
                          disabled={match.hasScored}
                          size="sm"
                        >
                          {match.hasScored ? 'Sudah Dinilai' : 'Beri Nilai'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasAllTeams && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Room belum lengkap. Hubungi admin.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opening Government */}
                    {match.team1 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                        <div className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">
                          Opening Government (OG)
                        </div>
                        <div className="font-medium">{match.team1.teamName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {match.team1.members?.slice(0, 2).map((m, i) => (
                            <div key={i}>{m.participant?.fullName || m.fullName}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opening Opposition */}
                    {match.team2 && (
                      <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950">
                        <div className="font-semibold text-sm text-red-800 dark:text-red-200 mb-1">
                          Opening Opposition (OO)
                        </div>
                        <div className="font-medium">{match.team2.teamName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {match.team2.members?.slice(0, 2).map((m, i) => (
                            <div key={i}>{m.participant?.fullName || m.fullName}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Closing Government */}
                    {match.team3 && (
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                        <div className="font-semibold text-sm text-green-800 dark:text-green-200 mb-1">
                          Closing Government (CG)
                        </div>
                        <div className="font-medium">{match.team3.teamName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {match.team3.members?.slice(0, 2).map((m, i) => (
                            <div key={i}>{m.participant?.fullName || m.fullName}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Closing Opposition */}
                    {match.team4 && (
                      <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
                        <div className="font-semibold text-sm text-purple-800 dark:text-purple-200 mb-1">
                          Closing Opposition (CO)
                        </div>
                        <div className="font-medium">{match.team4.teamName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {match.team4.members?.slice(0, 2).map((m, i) => (
                            <div key={i}>{m.participant?.fullName || m.fullName}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

        {/* Scoring Dialog */}
        <Dialog open={isScoringDialogOpen} onOpenChange={setIsScoringDialogOpen}>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Score Match Room {selectedMatch?.matchNumber}</DialogTitle>
            </DialogHeader>
            {selectedMatch && (
              <BPScoringForm
                match={selectedMatch}
                onSubmit={handleScoreSubmit}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
