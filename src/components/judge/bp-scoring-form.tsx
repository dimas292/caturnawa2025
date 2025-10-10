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
import { parseCommaDecimal, formatCommaDecimal } from "@/lib/number-utils"

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

  const validateScores = () => {
    const newErrors: string[] = []

    // Count actual teams present
    const actualTeams = teams.filter(team => team !== null && team !== undefined)
    const actualTeamCount = actualTeams.length

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
        team1: teamScores[0],
        team2: teamScores[1],
        team3: teamScores[2],
        team4: teamScores[3],
        ranking: ranking
      }
      
      await onSubmit(scores)
    } catch (error) {
      console.error('Error submitting scores:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateTeamRanking = (teamIndex: number, ranking: number) => {
    const newRankings = [...teamRankings]
    
    // Clear any existing team with this ranking
    const existingIndex = newRankings.indexOf(ranking)
    if (existingIndex !== -1) {
      newRankings[existingIndex] = 0
    }
    
    newRankings[teamIndex] = ranking
    setTeamRankings(newRankings)
    setHasUserInput(true)
  }

  const updateSpeakerScore = (teamIndex: number, speakerIndex: number, scoreInput: string) => {
    const score = parseCommaDecimal(scoreInput)
    const newScores = [...speakerScores]
    newScores[teamIndex][speakerIndex] = score
    setSpeakerScores(newScores)
    setHasUserInput(true)
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {match.roundName} - Room {match.matchNumber}
          </CardTitle>
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

      {/* Debug Info
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <div className="text-sm">
          <strong>🔍 Debug Info:</strong><br/>
          Teams found: {teams.filter(t => t).length}<br/>
          Match ID: {match.id}<br/>
          Team data: {JSON.stringify(teams.map(t => t ? { id: t.id, name: t.teamName, membersCount: t.members?.length || 0 } : null), null, 2)}
        </div>
      </div> */}

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
        {presentTeams.map((team, teamIndex) => {
          console.log(`Team ${teamIndex}:`, team)
          
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
                {/* Team Ranking */}
                <div>
                  <Label>Team Ranking</Label>
                  <Select 
                    value={currentRank > 0 ? currentRank.toString() : ""} 
                    onValueChange={(value) => updateTeamRanking(teamIndex, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ranking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Place (3 points)</SelectItem>
                      <SelectItem value="2">2nd Place (2 points)</SelectItem>
                      <SelectItem value="3">3rd Place (1 point)</SelectItem>
                      <SelectItem value="4">4th Place (0 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Speaker Scores */}
                <div className="space-y-3">
                  <Label>Speaker Scores (0-100)</Label>
                  {(team.members || []).slice(0, 2).map((member, speakerIndex) => (
                    <div key={speakerIndex} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{member.participant?.fullName || member.fullName || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {position?.speakers?.[speakerIndex] || `Speaker ${speakerIndex + 1}`}
                        </div>
                      </div>
                      <div className="w-20">
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="70,5"
                          value={speakerScores[teamIndex][speakerIndex] > 0 ? formatCommaDecimal(speakerScores[teamIndex][speakerIndex], 1) : ""}
                          onChange={(e) => updateSpeakerScore(teamIndex, speakerIndex, e.target.value)}
                          className="text-center"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-sm text-muted-foreground">
                    Team Total: {speakerScores[teamIndex].reduce((sum, score) => sum + score, 0)} points
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>)
      })()}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !hasUserInput}
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Scores"}
        </Button>
      </div>

    </div>
  )
}
