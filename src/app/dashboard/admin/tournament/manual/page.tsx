"use client"

import { useState, useEffect } from "react"
import { useRequireRole } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Trophy,
  Users,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Trash2,
  Edit,
  Save
} from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  teamName: string
  competitionType: string
  competitionName: string
  leader: {
    fullName: string
    university: string
  }
  members: Array<{
    fullName: string
    position: number
  }>
  memberCount: number
}

interface MatchSetup {
  room: string
  teams: string[] // team IDs
}

export default function ManualTournamentPage() {
  const { user, isLoading: authLoading } = useRequireRole("admin")

  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<'KDBI' | 'EDC'>('KDBI')
  const [selectedStage, setSelectedStage] = useState<string>('PRELIMINARY')
  const [roundName, setRoundName] = useState<string>('')
  const [matches, setMatches] = useState<MatchSetup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const stages = [
    { value: 'PRELIMINARY', label: 'Preliminary Round' },
    { value: 'SEMIFINAL', label: 'Semifinal Round' },
    { value: 'FINAL', label: 'Grand Final' } // Changed to emphasize single round
  ]

  useEffect(() => {
    loadTeams()
  }, [selectedCompetition])

  const loadTeams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/debate/teams?competitionType=${selectedCompetition}`)

      console.log('API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        console.log('Teams by competition:', data.data.teamsByCompetition)
        console.log('Selected competition teams:', data.data.teamsByCompetition[selectedCompetition])

        const teamsForCompetition = data.data.teamsByCompetition[selectedCompetition] || []
        console.log('Setting teams:', teamsForCompetition)
        setTeams(teamsForCompetition)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setError(errorData.error || 'Failed to load teams')
      }
    } catch (err) {
      console.error('Load teams error:', err)
      setError('Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }

  const addMatch = () => {
    setMatches([...matches, { room: `Room ${matches.length + 1}`, teams: ['', '', '', ''] }])
  }

  const removeMatch = (index: number) => {
    setMatches(matches.filter((_, i) => i !== index))
  }

  const updateMatch = (index: number, field: 'room', value: string) => {
    const updated = [...matches]
    updated[index] = { ...updated[index], [field]: value }
    setMatches(updated)
  }

  const updateMatchTeam = (matchIndex: number, teamIndex: number, teamId: string) => {
    const updated = [...matches]
    updated[matchIndex].teams[teamIndex] = teamId
    setMatches(updated)
  }

  const getAvailableTeams = (currentMatchIndex: number, currentTeamIndex: number) => {
    // Get teams that are not already selected in other positions
    const usedTeams = new Set<string>()

    matches.forEach((match, matchIdx) => {
      match.teams.forEach((teamId, teamIdx) => {
        if (teamId && (matchIdx !== currentMatchIndex || teamIdx !== currentTeamIndex)) {
          usedTeams.add(teamId)
        }
      })
    })

    return teams.filter(team => !usedTeams.has(team.id))
  }

  const validateMatches = () => {
    if (matches.length === 0) {
      return "Please add at least one match"
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      if (!match.room.trim()) {
        return `Match ${i + 1}: Room name is required`
      }

      const filledTeams = match.teams.filter(t => t)
      if (filledTeams.length !== 4) {
        return `Match ${i + 1}: Must select exactly 4 teams for British Parliamentary format`
      }
    }

    return null
  }

  const createMatches = async () => {
    try {
      setIsCreating(true)
      setError(null)

      const validationError = validateMatches()
      if (validationError) {
        setError(validationError)
        return
      }

      const response = await fetch('/api/admin/debate/manual-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          competitionType: selectedCompetition,
          stage: selectedStage,
          roundName: roundName || `${selectedStage} Round 1`,
          matches: matches.map(match => ({
            room: match.room,
            teams: match.teams
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create matches')
      }

      const result = await response.json()
      setSuccess(`Successfully created ${result.data.matchesCreated} matches`)

      // Reset form
      setMatches([])
      setRoundName('')
      setShowCreateDialog(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create matches')
    } finally {
      setIsCreating(false)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  const bpPositions = ['Opening Government', 'Opening Opposition', 'Closing Government', 'Closing Opposition']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/tournament">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tournament
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Manual Tournament Setup
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manually select teams for each room and match
              </p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Matches
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Tournament Matches</DialogTitle>
                <DialogDescription>
                  Set up tournament details before creating matches.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="competition">Competition</Label>
                  <Select value={selectedCompetition} onValueChange={(value: 'KDBI' | 'EDC') => setSelectedCompetition(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KDBI">KDBI</SelectItem>
                      <SelectItem value="EDC">EDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roundName">Round Name (Optional)</Label>
                  <Input
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    placeholder="e.g., Preliminary Round 1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { setShowCreateDialog(false); addMatch(); }}>
                  Start Setup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

        {/* Competition Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedCompetition} Teams ({teams.length} teams available)
            </CardTitle>
            <CardDescription>
              Available verified teams for {selectedCompetition} competition
              {isLoading && <span className="text-blue-600"> - Loading...</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading teams...</span>
              </div>
            ) : teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-3">
                    <h4 className="font-medium">{team.teamName}</h4>
                    <p className="text-sm text-gray-500">Leader: {team.leader.fullName}</p>
                    <p className="text-xs text-gray-500">{team.leader.university}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {team.memberCount} members
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No verified teams found for {selectedCompetition}</p>
                <p className="text-sm">Make sure teams are registered and verified first</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Setup */}
        {matches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Match Setup ({matches.length} matches)
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addMatch}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Match
                  </Button>
                  <Button
                    onClick={createMatches}
                    disabled={isCreating || validateMatches() !== null}
                  >
                    {isCreating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save All Matches
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Set up British Parliamentary matches (4 teams each). Each team can only be used once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {matches.map((match, matchIndex) => (
                  <div key={matchIndex} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium">Match {matchIndex + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`room-${matchIndex}`} className="text-sm">Room:</Label>
                          <Input
                            id={`room-${matchIndex}`}
                            value={match.room}
                            onChange={(e) => updateMatch(matchIndex, 'room', e.target.value)}
                            className="w-32"
                            placeholder="Room name"
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMatch(matchIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {bpPositions.map((position, teamIndex) => (
                        <div key={teamIndex} className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            {position}
                          </Label>
                          <Select
                            value={match.teams[teamIndex]}
                            onValueChange={(value) => updateMatchTeam(matchIndex, teamIndex, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableTeams(matchIndex, teamIndex).map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{team.teamName}</span>
                                    <span className="text-xs text-gray-500">{team.leader.fullName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>British Parliamentary Format Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded bg-green-50">
                <h4 className="font-medium text-green-800">Opening Government</h4>
                <p className="text-sm text-gray-600">Prime Minister & Deputy PM</p>
              </div>
              <div className="text-center p-3 border rounded bg-red-50">
                <h4 className="font-medium text-red-800">Opening Opposition</h4>
                <p className="text-sm text-gray-600">Leader & Deputy Leader</p>
              </div>
              <div className="text-center p-3 border rounded bg-blue-50">
                <h4 className="font-medium text-blue-800">Closing Government</h4>
                <p className="text-sm text-gray-600">Member & Government Whip</p>
              </div>
              <div className="text-center p-3 border rounded bg-purple-50">
                <h4 className="font-medium text-purple-800">Closing Opposition</h4>
                <p className="text-sm text-gray-600">Member & Opposition Whip</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}