"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useRequireRole } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingPage } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Users,
  Trophy,
  Clock,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

interface MatchData {
  id: string
  matchNumber: number
  matchFormat: string
  round: {
    stage: string
    roundName: string
    competition: {
      name: string
      type: string
    }
  }
  team1: {
    id: string
    teamName: string
    leader: { fullName: string }
    members: Array<{
      participantId: string
      fullName: string
      position: number
    }>
  }
  team2: {
    id: string
    teamName: string
    leader: { fullName: string }
    members: Array<{
      participantId: string
      fullName: string
      position: number
    }>
  }
  team3?: {
    id: string
    teamName: string
    leader: { fullName: string }
    members: Array<{
      participantId: string
      fullName: string
      position: number
    }>
  }
  team4?: {
    id: string
    teamName: string
    leader: { fullName: string }
    members: Array<{
      participantId: string
      fullName: string
      position: number
    }>
  }
  status: string
  scheduledAt?: string
  completedAt?: string
}

interface ScoreEntry {
  participantId: string
  fullName: string
  teamName: string
  teamPosition: string  // 'OG', 'OO', 'CG', 'CO'
  bpPosition: string    // 'PM', 'DPM', 'LO', 'DLO', 'MG', 'GW', 'MO', 'OW'
  score: number
  speakerRank?: number  // 1-8 ranking
}

export default function ScoreMatchPage() {
  const { matchId } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useRequireRole("judge")

  const [match, setMatch] = useState<MatchData | null>(null)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [existingScores, setExistingScores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (matchId) {
      loadMatchData()
    }
  }, [matchId])

  const loadMatchData = async () => {
    try {
      setIsLoading(true)
      
      // Load match details
      const matchResponse = await fetch(`/api/judge/debate-matches?matchId=${matchId}`)
      if (!matchResponse.ok) throw new Error('Failed to load match')
      
      const matchData = await matchResponse.json()
      const matchInfo = matchData.data.matches?.[0]
      
      if (!matchInfo) throw new Error('Match not found')
      
      setMatch(matchInfo)

      // Load existing scores
      const scoresResponse = await fetch(`/api/judge/score?matchId=${matchId}`)
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json()
        setExistingScores(scoresData.data.scores || [])
      }

      // Initialize BP score entries (4 teams, 2 speakers each)
      const bpPositions = {
        team1: { teamPosition: 'OG', positions: ['PM', 'DPM'] },
        team2: { teamPosition: 'OO', positions: ['LO', 'DLO'] },
        team3: { teamPosition: 'CG', positions: ['MG', 'GW'] },
        team4: { teamPosition: 'CO', positions: ['MO', 'OW'] }
      }

      const allParticipants = []
      
      if (matchInfo.team1) {
        matchInfo.team1.members.forEach((m: any, idx: number) => {
          allParticipants.push({
            participantId: m.participantId,
            fullName: m.fullName,
            teamName: matchInfo.team1.teamName,
            teamPosition: 'OG',
            bpPosition: bpPositions.team1.positions[idx] || `Speaker${idx + 1}`,
            score: 0,
            speakerRank: 0
          })
        })
      }
      
      if (matchInfo.team2) {
        matchInfo.team2.members.forEach((m: any, idx: number) => {
          allParticipants.push({
            participantId: m.participantId,
            fullName: m.fullName,
            teamName: matchInfo.team2.teamName,
            teamPosition: 'OO',
            bpPosition: bpPositions.team2.positions[idx] || `Speaker${idx + 1}`,
            score: 0,
            speakerRank: 0
          })
        })
      }

      if (matchInfo.team3) {
        matchInfo.team3.members.forEach((m: any, idx: number) => {
          allParticipants.push({
            participantId: m.participantId,
            fullName: m.fullName,
            teamName: matchInfo.team3.teamName,
            teamPosition: 'CG',
            bpPosition: bpPositions.team3.positions[idx] || `Speaker${idx + 1}`,
            score: 0,
            speakerRank: 0
          })
        })
      }

      if (matchInfo.team4) {
        matchInfo.team4.members.forEach((m: any, idx: number) => {
          allParticipants.push({
            participantId: m.participantId,
            fullName: m.fullName,
            teamName: matchInfo.team4.teamName,
            teamPosition: 'CO',
            bpPosition: bpPositions.team4.positions[idx] || `Speaker${idx + 1}`,
            score: 0,
            speakerRank: 0
          })
        })
      }

      // Apply existing scores if any
      const scoresWithExisting = allParticipants.map(participant => {
        const existing = scoresData?.data?.scores?.find(
          (s: any) => s.participantId === participant.participantId
        )
        return {
          ...participant,
          score: existing?.score || 0
        }
      })

      setScores(scoresWithExisting)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match data')
    } finally {
      setIsLoading(false)
    }
  }

  const updateScore = (participantId: string, score: number) => {
    // Validate score range
    if (score < 0 || score > 100) {
      setError('Score must be between 0 and 100')
      return
    }

    setScores(prev => prev.map(s => 
      s.participantId === participantId ? { ...s, score } : s
    ))
    setError(null)
  }

  const saveScores = async (markCompleted = false) => {
    try {
      setIsSaving(true)
      setError(null)

      // Validate all scores are entered
      const unscored = scores.filter(s => s.score === 0)
      if (unscored.length > 0 && markCompleted) {
        setError('Please enter scores for all participants before marking as completed')
        return
      }

      const response = await fetch('/api/judge/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          matchId: matchId,
          scores: scores.map(s => ({
            participantId: s.participantId,
            score: s.score
          })),
          markAsCompleted: markCompleted
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save scores')
      }

      const result = await response.json()
      setSuccess(result.message)

      if (markCompleted) {
        // Redirect back to dashboard after completion
        setTimeout(() => {
          router.push('/dashboard/judge')
        }, 2000)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scores')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
          <Link href="/dashboard/judge">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate team scores for BP format
  const ogScores = scores.filter(s => s.teamPosition === 'OG')
  const ooScores = scores.filter(s => s.teamPosition === 'OO')
  const cgScores = scores.filter(s => s.teamPosition === 'CG')
  const coScores = scores.filter(s => s.teamPosition === 'CO')
  
  const ogAvg = ogScores.length > 0 ? ogScores.reduce((sum, s) => sum + s.score, 0) / ogScores.length : 0
  const ooAvg = ooScores.length > 0 ? ooScores.reduce((sum, s) => sum + s.score, 0) / ooScores.length : 0
  const cgAvg = cgScores.length > 0 ? cgScores.reduce((sum, s) => sum + s.score, 0) / cgScores.length : 0
  const coAvg = coScores.length > 0 ? coScores.reduce((sum, s) => sum + s.score, 0) / coScores.length : 0

  // Calculate team positions (1st, 2nd, 3rd, 4th)
  const teamAverages = [
    { position: 'OG', avg: ogAvg, team: match.team1 },
    { position: 'OO', avg: ooAvg, team: match.team2 },
    { position: 'CG', avg: cgAvg, team: match.team3 },
    { position: 'CO', avg: coAvg, team: match.team4 }
  ].filter(t => t.team).sort((a, b) => b.avg - a.avg)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/judge">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Score Match</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {match.round.competition.name} - {match.round.roundName} - Match #{match.matchNumber}
              </p>
            </div>
          </div>
          <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
            {match.status.toUpperCase()}
          </Badge>
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

        {/* BP Match Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              British Parliamentary Match Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Opening Government */}
              <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="font-bold text-sm text-green-800 dark:text-green-200">Opening Government</h3>
                <h4 className="font-bold text-lg">{match.team1?.teamName}</h4>
                <p className="text-sm text-gray-500">{match.team1?.leader.fullName}</p>
                {ogAvg > 0 && (
                  <div className="mt-2">
                    <span className="text-xl font-bold text-green-600">{ogAvg.toFixed(1)}</span>
                    <p className="text-xs text-gray-500">Team Avg</p>
                  </div>
                )}
              </div>

              {/* Opening Opposition */}
              <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                <h3 className="font-bold text-sm text-red-800 dark:text-red-200">Opening Opposition</h3>
                <h4 className="font-bold text-lg">{match.team2?.teamName}</h4>
                <p className="text-sm text-gray-500">{match.team2?.leader.fullName}</p>
                {ooAvg > 0 && (
                  <div className="mt-2">
                    <span className="text-xl font-bold text-red-600">{ooAvg.toFixed(1)}</span>
                    <p className="text-xs text-gray-500">Team Avg</p>
                  </div>
                )}
              </div>

              {/* Closing Government */}
              <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-bold text-sm text-blue-800 dark:text-blue-200">Closing Government</h3>
                <h4 className="font-bold text-lg">{match.team3?.teamName}</h4>
                <p className="text-sm text-gray-500">{match.team3?.leader.fullName}</p>
                {cgAvg > 0 && (
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">{cgAvg.toFixed(1)}</span>
                    <p className="text-xs text-gray-500">Team Avg</p>
                  </div>
                )}
              </div>

              {/* Closing Opposition */}
              <div className="text-center p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <h3 className="font-bold text-sm text-purple-800 dark:text-purple-200">Closing Opposition</h3>
                <h4 className="font-bold text-lg">{match.team4?.teamName}</h4>
                <p className="text-sm text-gray-500">{match.team4?.leader.fullName}</p>
                {coAvg > 0 && (
                  <div className="mt-2">
                    <span className="text-xl font-bold text-purple-600">{coAvg.toFixed(1)}</span>
                    <p className="text-xs text-gray-500">Team Avg</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Rankings */}
            {teamAverages.length > 0 && teamAverages.some(t => t.avg > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2 text-center">Current Rankings</h4>
                <div className="flex justify-center gap-4">
                  {teamAverages.slice(0, 4).map((team, index) => (
                    <div key={team.position} className="text-center">
                      <div className={`text-sm font-bold ${
                        index === 0 ? 'text-yellow-600' : 
                        index === 1 ? 'text-gray-600' : 
                        index === 2 ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                        {index + 1}
                        {index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}
                      </div>
                      <div className="text-xs">{team.position}</div>
                      <div className="text-xs font-medium">{team.avg.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team 1 Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {match.team1.teamName}
              </CardTitle>
              <CardDescription>Enter individual scores for each member (0-100)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team1Scores.map((participant, index) => (
                  <div key={participant.participantId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {participant.fullName}
                      </Label>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={participant.score}
                        onChange={(e) => updateScore(participant.participantId, parseFloat(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                  </div>
                ))}
                {team1Avg > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Team Average:</span>
                      <span className="text-lg font-bold text-blue-600">{team1Avg.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team 2 Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {match.team2.teamName}
              </CardTitle>
              <CardDescription>Enter individual scores for each member (0-100)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team2Scores.map((participant, index) => (
                  <div key={participant.participantId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {participant.fullName}
                      </Label>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={participant.score}
                        onChange={(e) => updateScore(participant.participantId, parseFloat(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                  </div>
                ))}
                {team2Avg > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Team Average:</span>
                      <span className="text-lg font-bold text-green-600">{team2Avg.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>Score Range: 0-100 (decimals allowed)</p>
                <p>Higher score wins the match</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => saveScores(false)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button 
                  onClick={() => saveScores(true)}
                  disabled={isSaving || scores.some(s => s.score === 0)}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}