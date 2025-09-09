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
  BarChart3
} from "lucide-react"

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
                  <Button 
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
                        Generate Tournament
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
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
                      Regenerate
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
        </div>
      </div>
    </div>
  )
}