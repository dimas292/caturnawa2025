"use client"

import { useState, useEffect, useCallback } from "react"
import { useRequireRoles } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoadingPage } from "@/components/ui/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ModeToggle } from "@/components/ui/mode-toggle"
import BPScoringForm from "@/components/judge/bp-scoring-form"
import {
  Trophy,
  Clock,
  CheckCircle,
  Users,
  ArrowLeft,
  AlertCircle,
  FileText,
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
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const router = useRouter()
  const [selectedStage, setSelectedStage] = useState("PRELIMINARY")
  const [selectedRound, setSelectedRound] = useState(1)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isScoringDialogOpen, setIsScoringDialogOpen] = useState(false)
  const [isMatchesLoading, setIsMatchesLoading] = useState(false)

  const fetchMatches = useCallback(async () => {
    setIsMatchesLoading(true)
    try {
      const response = await fetch(
        `/api/judge/matches?stage=${selectedStage}&round=${selectedRound}&competition=EDC`
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch EDC matches:', { status: response.status, errorData })
        setMatches([])
        return
      }
      
      const data = await response.json()
      const normalized: Match[] = (Array.isArray(data.matches) ? data.matches : []).map((m: any) => ({
        id: m.id,
        matchNumber: m.matchNumber,
        roundName: m.roundName,
        stage: m.stage,
        team1: m.team1 ?? null,
        team2: m.team2 ?? null,
        team3: m.team3 ?? null,
        team4: m.team4 ?? null,
        hasScored: !!m.hasScored,
        isCompleted: !!m.isCompleted,
        scheduledAt: m.scheduledAt ?? undefined,
        completedAt: m.completedAt ?? undefined,
      }))
      setMatches(normalized)
    } catch (error) {
      console.error('Error fetching EDC matches:', error)
      setMatches([])
    } finally {
      setIsMatchesLoading(false)
    }
  }, [selectedStage, selectedRound])

  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user, fetchMatches])

  const handleScoreSubmit = async (scores: any) => {
    if (!selectedMatch) return
    
    try {
      const response = await fetch('/api/judge/submit-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          scores
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

  // Calculate stats
  const stats = {
    totalMatches: matches.length,
    activeMatches: matches.filter(m => !m.isCompleted).length,
    pendingReviews: matches.filter(m => !m.hasScored).length,
    completedScores: matches.filter(m => m.hasScored).length,
  }

  // Get available rounds based on stage
  const getAvailableRounds = () => {
    switch (selectedStage) {
      case 'PRELIMINARY': return [1, 2, 3, 4]
      case 'SEMIFINAL': return [1, 2]
      case 'FINAL': return [1, 2, 3]
      default: return [1]
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
      <div className="container mx-auto px-6 pt-12 pb-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          EDC - English Debate Competition
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          British Parliamentary debate scoring system dengan 4 teams per room
        </p>
      </div>

      {/* Stage & Round Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Stage & Round</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stage Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Stage</label>
            <div className="flex gap-3">
              <Button
                variant={selectedStage === "PRELIMINARY" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStage("PRELIMINARY")
                  setSelectedRound(1)
                }}
              >
                Preliminary
              </Button>
              <Button
                variant={selectedStage === "SEMIFINAL" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStage("SEMIFINAL")
                  setSelectedRound(1)
                }}
              >
                Semifinal
              </Button>
              <Button
                variant={selectedStage === "FINAL" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStage("FINAL")
                  setSelectedRound(1)
                }}
              >
                Final
              </Button>
            </div>
          </div>

          {/* Round Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Round</label>
            <div className="flex gap-2">
              {getAvailableRounds().map(round => (
                <Button
                  key={round}
                  variant={selectedRound === round ? "default" : "outline"}
                  onClick={() => setSelectedRound(round)}
                  size="sm"
                >
                  Round {round}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              Breakout rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeMatches}</div>
            <p className="text-xs text-muted-foreground">
              Belum selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu penilaian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedScores}</div>
            <p className="text-xs text-muted-foreground">
              Sudah dinilai
            </p>
          </CardContent>
        </Card>
      </div>

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
          <h2 className="text-xl font-semibold">
            {selectedStage.charAt(0) + selectedStage.slice(1).toLowerCase()} Round {selectedRound} - Matches
          </h2>
          
          {matches.map(match => {
            const teams = [match.team1, match.team2, match.team3, match.team4].filter(Boolean)
            const hasAllTeams = teams.length === 4

            return (
              <Card key={match.id} className={match.hasScored ? "border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Room {match.matchNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">{match.roundName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(match)}
                      {hasAllTeams && (
                        <Button
                          onClick={() => openScoringDialog(match)}
                          disabled={match.hasScored}
                          size="sm"
                        >
                          {match.hasScored ? 'Scored' : 'Score Match'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasAllTeams && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This room doesn't have 4 teams assigned yet. Please contact admin.
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
            <DialogTitle>Score Match - Room {selectedMatch?.matchNumber}</DialogTitle>
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
