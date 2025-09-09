"use client"

import { useState, useEffect } from "react"
import { useRequireRole } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Play,
  BarChart3,
  Radio,
  Square,
  Eye
} from "lucide-react"
import Link from "next/link"

interface TournamentStatus {
  competition: {
    id: string
    name: string
    type: string
    registrations: Array<{
      id: string
      teamName: string
      participant: { fullName: string }
    }>
    rounds: Array<{
      id: string
      stage: string
      roundName: string
      matches: Array<{
        id: string
        matchNumber: number
        team1?: { teamName: string }
        team2?: { teamName: string }
        _count: { scores: number }
      }>
    }>
  }
  stats: {
    totalTeams: number
    totalRounds: number
    totalMatches: number
    completedMatches: number
    byStage: Record<string, number>
  }
}

export default function TournamentManagementPage() {
  const { user, isLoading: authLoading } = useRequireRole("admin")
  
  const [kdbietStatus, setKdbiStatus] = useState<TournamentStatus | null>(null)
  const [edcStatus, setEdcStatus] = useState<TournamentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [liveMatches, setLiveMatches] = useState<any[]>([])
  const [isManagingMatch, setIsManagingMatch] = useState<string | null>(null)
  const [availableMatches, setAvailableMatches] = useState<Record<string, any[]>>({})
  const [showStartDialog, setShowStartDialog] = useState<string | null>(null)

  useEffect(() => {
    loadTournamentStatus()
  }, [])

  const loadTournamentStatus = async () => {
    try {
      setIsLoading(true)
      
      // Load KDBI status
      const kdbiResponse = await fetch('/api/admin/debate/generate-tournament?competitionType=KDBI')
      if (kdbiResponse.ok) {
        const kdbiData = await kdbiResponse.json()
        setKdbiStatus(kdbiData.data)
      }

      // Load EDC status
      const edcResponse = await fetch('/api/admin/debate/generate-tournament?competitionType=EDC')
      if (edcResponse.ok) {
        const edcData = await edcResponse.json()
        setEdcStatus(edcData.data)
      }

      // Load live matches
      const liveResponse = await fetch('/api/admin/debate/live-match')
      if (liveResponse.ok) {
        const liveData = await liveResponse.json()
        setLiveMatches(liveData.data.liveMatches || [])
      }

    } catch (err) {
      setError('Failed to load tournament status')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTournament = async (competitionType: 'KDBI' | 'EDC') => {
    try {
      setIsGenerating(competitionType)
      setError(null)

      const response = await fetch('/api/admin/debate/generate-tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitionType })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate tournament')
      }

      const result = await response.json()
      setSuccess(`Tournament generated for ${competitionType}: ${result.data.roundsCreated} rounds, ${result.data.matchesCreated} matches`)
      
      // Reload status
      await loadTournamentStatus()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tournament')
    } finally {
      setIsGenerating(null)
    }
  }

  const manageLiveMatch = async (matchId: string, action: 'start' | 'stop') => {
    try {
      setIsManagingMatch(matchId)
      setError(null)

      const response = await fetch('/api/admin/debate/live-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matchId, action })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} match`)
      }

      const result = await response.json()
      setSuccess(result.message)
      
      // Reload status to update live matches
      await loadTournamentStatus()

    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} match`)
    } finally {
      setIsManagingMatch(null)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  const renderTournamentCard = (
    title: string,
    competitionType: 'KDBI' | 'EDC',
    status: TournamentStatus | null
  ) => {
    const hasMatches = status && status.stats.totalMatches > 0
    const completionRate = hasMatches ? (status.stats.completedMatches / status.stats.totalMatches) * 100 : 0

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {title}
            </div>
            {hasMatches ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="outline">Not Generated</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {status ? `${status.stats.totalTeams} teams registered` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold">{status.stats.totalTeams}</div>
                  <div className="text-sm text-gray-500">Teams</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold">{status.stats.totalMatches}</div>
                  <div className="text-sm text-gray-500">Matches</div>
                </div>
              </div>

              {/* Progress */}
              {hasMatches && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tournament Progress</span>
                    <span>{status.stats.completedMatches}/{status.stats.totalMatches} ({Math.round(completionRate)}%)</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              )}

              {/* Stage Breakdown */}
              {hasMatches && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Matches by Stage:</h4>
                  {Object.entries(status.stats.byStage).map(([stage, count]) => (
                    <div key={stage} className="flex justify-between text-sm">
                      <span>{stage}:</span>
                      <span>{count} matches</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {!hasMatches ? (
                  <div className="w-full space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/dashboard/admin/tournament/manual">
                        <Settings className="h-4 w-4 mr-2" />
                        Setup Manual Tournament
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => generateTournament(competitionType)}
                      disabled={isGenerating !== null || status.stats.totalTeams < 4}
                      className="w-full"
                    >
                      {isGenerating === competitionType ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Auto Generate (Advanced)
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Matches
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => generateTournament(competitionType)}
                      disabled={isGenerating !== null}
                    >
                      {isGenerating === competitionType ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Reset & Regenerate
                    </Button>
                  </>
                )}
              </div>

              {status.stats.totalTeams < 4 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Need at least 4 verified teams to generate tournament. Currently have {status.stats.totalTeams}.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading tournament data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Tournament Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate and manage debate tournaments for KDBI and EDC competitions
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTournamentCard("KDBI Tournament", "KDBI", kdbietStatus)}
          {renderTournamentCard("EDC Tournament", "EDC", edcStatus)}
        </div>

        {/* Live Match Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Live Match Management
              {liveMatches.length > 0 && (
                <Badge variant="destructive">{liveMatches.length} LIVE</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Start or stop live matches for judges to score in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liveMatches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">Currently Live Matches</span>
                </div>
                {liveMatches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{match.round.competition.name} - {match.round.roundName}</h4>
                        <p className="text-sm text-gray-500">Match #{match.matchNumber}</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-xs">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            OG: {match.team1?.teamName}
                          </span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            OO: {match.team2?.teamName}
                          </span>
                          {match.team3 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              CG: {match.team3?.teamName}
                            </span>
                          )}
                          {match.team4 && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              CO: {match.team4?.teamName}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        Scores: {match._count.scores || 0} / {(match.team3 && match.team4) ? 8 : 4} speakers
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Monitor
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => manageLiveMatch(match.id, 'stop')}
                          disabled={isManagingMatch === match.id}
                        >
                          {isManagingMatch === match.id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Square className="h-4 w-4 mr-1" />
                          )}
                          Stop Live
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Radio className="mx-auto h-12 w-12 mb-4" />
                <p>Tidak ada pertandingan live saat ini</p>
                <p className="text-sm">Generate tournament dahulu untuk memulai pertandingan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tournament Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Preliminary Stage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  4 rounds of Swiss-system pairing. All teams compete to accumulate victory points.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Semifinal Stage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Top 8 teams advance. 2 semifinal matches determine finalists.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Final Stage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Championship match between top 2 teams, plus 3rd place match.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={loadTournamentStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/tournament/manual">
              <Settings className="h-4 w-4 mr-2" />
              Manual Tournament Setup
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}