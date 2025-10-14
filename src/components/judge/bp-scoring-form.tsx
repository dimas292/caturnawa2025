// src/components/judge/bp-scoring-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Trophy, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseCommaDecimal, formatCommaDecimal, cleanNumberInput } from "@/lib/number-utils"

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
  judge?: {
    id: string
    name: string
    email: string
  } | null
  team1?: Team
  team2?: Team
  team3?: Team
  team4?: Team
  roundName: string
  stage: string
}

interface BPScoringFormProps {
  match: Match
  onSubmit: (scores: any) => Promise<void>
}

const BP_POSITIONS = {
  1: { name: 'Opening Government (OG)', speakers: ['Prime Minister (PM)', 'Deputy Prime Minister (DPM)'], color: 'bg-blue-100 text-blue-800' },
  2: { name: 'Opening Opposition (OO)', speakers: ['Leader of Opposition (LO)', 'Deputy Leader of Opposition (DLO)'], color: 'bg-red-100 text-red-800' },
  3: { name: 'Closing Government (CG)', speakers: ['Member of Government (MG)', 'Government Whip (GW)'], color: 'bg-green-100 text-green-800' },
  4: { name: 'Closing Opposition (CO)', speakers: ['Member of Opposition (MO)', 'Opposition Whip (OW)'], color: 'bg-purple-100 text-purple-800' }
}

const VICTORY_POINTS = { 1: 3, 2: 2, 3: 1, 4: 0 }

export default function BPScoringForm({ match, onSubmit }: BPScoringFormProps) {
  const [teamRankings, setTeamRankings] = useState<number[]>([0, 0, 0, 0])
  const [speakerScores, setSpeakerScores] = useState<number[][]>([
    [0, 0], [0, 0], [0, 0], [0, 0]
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [hasUserInput, setHasUserInput] = useState(false)

  const teams = [
    match.team1,
    match.team2, 
    match.team3,
    match.team4
  ]

  // Check if minimum teams have scores
  const getTeamsWithScores = () => {
    return teams.filter((team, teamIndex) => {
      if (!team) return false
      const hasScores = speakerScores[teamIndex].some(score => score > 0)
      const hasRanking = teamRankings[teamIndex] > 0
      return hasScores || hasRanking
    }).length
  }

  const canSubmit = getTeamsWithScores() >= 2

  const validateScores = () => {
    const newErrors: string[] = []

    // Count actual teams present
    const actualTeams = teams.filter(team => team !== null && team !== undefined)
    const actualTeamCount = actualTeams.length

    // Check minimum teams requirement
    const teamsWithScores = getTeamsWithScores()
    if (teamsWithScores < 2) {
      newErrors.push("At least 2 teams must have scores entered")
    }

    // Check team rankings - only validate for teams that exist
    const usedRankings = teamRankings.slice(0, actualTeamCount).filter(r => r > 0)
    const uniqueRankings = new Set(usedRankings)
    
    if (usedRankings.length !== actualTeamCount) {
      newErrors.push(`All ${actualTeamCount} teams must be ranked (1st, 2nd, 3rd, 4th)`)
    }
    
    if (uniqueRankings.size !== usedRankings.length) {
      newErrors.push("Each team must have a unique ranking")
    }

    // Check speaker scores - only for teams that exist
    actualTeams.forEach((team, actualIndex) => {
      const teamIndex = teams.indexOf(team)
      if (teamIndex >= 0) {
        speakerScores[teamIndex].forEach((score, speakerIndex) => {
          if (score === 0) {
            newErrors.push(`${team.teamName} Speaker ${speakerIndex + 1}: Please enter a score`)
          } else if (score < 0 || score > 100) {
            newErrors.push(`${team.teamName} Speaker ${speakerIndex + 1}: Score must be between 0-100`)
          }
        })
      }
    })

    // Check if user has made any input
    if (!hasUserInput) {
      newErrors.push("Please input scores and rankings before submitting")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async () => {
    if (!validateScores()) return

    setIsSubmitting(true)
    try {
      // Calculate team scores from individual speaker scores
      const teamScores = speakerScores.map(speakers => ({
        speaker1: speakers[0],
        speaker2: speakers[1],
        teamScore: speakers[0] + speakers[1]
      }))

      // Create ranking array based on team rankings
      const ranking = [0, 0, 0, 0]
      teamRankings.forEach((rank, teamIndex) => {
        if (rank > 0) {
          ranking[rank - 1] = teamIndex
        }
      })

      const scores = {
        teamRankings: teamRankings, // [2,1,4,3] format
        teams: [
          { speakers: [speakerScores[0][0], speakerScores[0][1]] },
          { speakers: [speakerScores[1][0], speakerScores[1][1]] },
          { speakers: [speakerScores[2][0], speakerScores[2][1]] },
          { speakers: [speakerScores[3][0], speakerScores[3][1]] }
        ]
      }
      
      await onSubmit(scores)
    } catch (error) {
      console.error('Error submitting scores:', error)
    } finally {
      setIsSubmitting(false)
    }
  }


  const [inputValues, setInputValues] = useState<string[][]>([
    ['', ''], ['', ''], ['', ''], ['', '']
  ])

  // Auto-rank teams based on total scores
  const autoRankTeams = (scores: number[][]) => {
    // Calculate team totals with team index
    const teamTotals = scores.map((teamScores, index) => ({
      teamIndex: index,
      total: teamScores[0] + teamScores[1],
      hasScores: teamScores[0] > 0 || teamScores[1] > 0
    }))
    
    // Filter teams with scores and sort by total (descending)
    const rankedTeams = teamTotals
      .filter(t => t.hasScores)
      .sort((a, b) => b.total - a.total)
    
    // Assign rankings (1st = highest, 4th = lowest)
    const newRankings = [0, 0, 0, 0]
    rankedTeams.forEach((team, rank) => {
      newRankings[team.teamIndex] = rank + 1
    })
    
    setTeamRankings(newRankings)
  }

  const updateSpeakerScore = (teamIndex: number, speakerIndex: number, rawInput: string) => {
    // Store raw input value for controlled input
    const newInputValues = [...inputValues]
    newInputValues[teamIndex][speakerIndex] = rawInput
    setInputValues(newInputValues)
    
    // Clean and validate input
    const cleaned = cleanNumberInput(rawInput, 2)
    const score = parseCommaDecimal(cleaned)
    
    // Clamp to valid range (0-100)
    const validScore = Math.min(100, Math.max(0, score))
    
    const newScores = [...speakerScores]
    newScores[teamIndex][speakerIndex] = validScore
    setSpeakerScores(newScores)
    setHasUserInput(true)
    
    // Auto-rank teams after score update
    autoRankTeams(newScores)
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {match.roundName} Room {match.matchNumber}
          </CardTitle>
          {match.judge && (
            <p className="text-md font-bold text-muted-foreground mt-2">
              Juri: {match.judge.name || match.judge.email}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Team Scoring */}
      {teams.filter(t => t).length < 4 && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Match ini belum memiliki 4 tim lengkap. Silakan pastikan pairing sudah dibuat dan tim sudah di-assign ke Room ini.
          </AlertDescription>
        </Alert>
      )}

      {(() => {
        const presentTeams = teams.filter((t): t is Team => t !== null && t !== undefined)
        return (
        <div className="grid gap-6">
        {presentTeams.map((team) => {
          // CRITICAL: Use original index from teams array, not filtered index
          const teamIndex = teams.indexOf(team)
          console.log(`Team original index ${teamIndex}:`, team)
          
          const position = BP_POSITIONS[teamIndex + 1 as keyof typeof BP_POSITIONS]
          const currentRank = teamRankings[teamIndex]
          const victoryPoints = currentRank > 0 ? VICTORY_POINTS[currentRank as keyof typeof VICTORY_POINTS] : 0

          return (
            <Card key={team.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {team.teamName}
                    </CardTitle>
                    <Badge className={position.color}>
                      {position.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Victory Points</div>
                    <div className="text-2xl font-bold text-primary">
                      {victoryPoints}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">

                {/* Speaker Scores */}
                <div className="space-y-3">
                  <Label>Speaker Scores (0-100)</Label>
                  {(team.members || []).slice(0, 2).map((member, speakerIndex) => {
                    const currentScore = speakerScores[teamIndex][speakerIndex]
                    const hasValue = currentScore > 0
                    
                    return (
                    <div key={speakerIndex} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{member.participant?.fullName || member.fullName || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {position?.speakers?.[speakerIndex] || `Speaker ${speakerIndex + 1}`}
                        </div>
                      </div>
                      <div className="w-24">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="75,5"
                          value={inputValues[teamIndex][speakerIndex]}
                          onChange={(e) => updateSpeakerScore(teamIndex, speakerIndex, e.target.value)}
                          className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-center ${hasValue ? 'font-semibold' : ''}`}
                        />
                      </div>
                    </div>
                    )
                  })}
                  
                  <div className="pt-2 border-t space-y-1">
                    {/* <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Team Total:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCommaDecimal(speakerScores[teamIndex].reduce((sum, score) => sum + score, 0), 2)}
                      </span>
                    </div> */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Average:</span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {formatCommaDecimal(speakerScores[teamIndex].reduce((sum, score) => sum + score, 0) / 2, 2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>)
      })()}

      {/* Submit Button */}
      <div className="flex flex-col items-end gap-2">
        {!canSubmit && (
          <p className="text-sm text-muted-foreground">
            Enter scores for at least 2 teams to enable submission
          </p>
        )}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !canSubmit}
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Scores"}
        </Button>
      </div>

    </div>
  )
}
