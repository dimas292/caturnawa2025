"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Eye, EyeOff, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Round {
  id: string
  roundName: string
  stage: string
  roundNumber: number
  session: number
  motion: string | null
  isFrozen: boolean
  frozenAt: string | null
  frozenBy: string | null
  totalMatches: number
  scoredMatches: number
  competition: {
    name: string
    shortName: string
    type: string
  }
}

export default function FrozenRoundsManager() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(false)
  const [competition, setCompetition] = useState("KDBI")
  const [stage, setStage] = useState<string>("ALL")
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchRounds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ competition })
      if (stage !== "ALL") {
        params.append("stage", stage)
      }
      
      const response = await fetch(`/api/admin/debate/get-rounds?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setRounds(data.rounds)
      }
    } catch (error) {
      console.error("Error fetching rounds:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRounds()
  }, [competition, stage])

  const toggleFrozen = async (roundId: string, currentStatus: boolean) => {
    setUpdating(roundId)
    try {
      const response = await fetch("/api/admin/debate/toggle-frozen-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId,
          isFrozen: !currentStatus
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setRounds(rounds.map(r => 
          r.id === roundId 
            ? { ...r, isFrozen: !currentStatus, frozenAt: !currentStatus ? new Date().toISOString() : null }
            : r
        ))
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error toggling frozen status:", error)
      alert("Failed to update frozen status")
    } finally {
      setUpdating(null)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "PRELIMINARY": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "SEMIFINAL": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "FINAL": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRounds = stage === "ALL" 
    ? rounds 
    : rounds.filter(r => r.stage === stage)

  const frozenCount = filteredRounds.filter(r => r.isFrozen).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">
          Control which rounds are hidden from public leaderboard calculations
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Frozen rounds</strong> are hidden from public leaderboard rankings. 
          Scores are still recorded but not displayed until you unfreeze the round.
          This is useful during tournament to maintain suspense.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Competition</Label>
              <Select value={competition} onValueChange={setCompetition}>
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
              <Label>Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stages</SelectItem>
                  <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                  <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchRounds} disabled={loading} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm pt-2 border-t">
            <div>
              <span className="text-muted-foreground">Total Rounds: </span>
              <span className="font-semibold">{filteredRounds.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Frozen: </span>
              <span className="font-semibold text-orange-600">{frozenCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Visible: </span>
              <span className="font-semibold text-green-600">{filteredRounds.length - frozenCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rounds List */}
      <Card>
        <CardHeader>
          <CardTitle>Rounds</CardTitle>
          <CardDescription>
            Toggle frozen status for each round
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading rounds...</p>
            </div>
          ) : filteredRounds.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No rounds found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRounds.map((round) => (
                <div
                  key={round.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    round.isFrozen ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{round.roundName}</h3>
                      <Badge className={getStageColor(round.stage)}>
                        {round.stage}
                      </Badge>
                      {round.isFrozen && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Frozen
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Round {round.roundNumber} • Session {round.session}</span>
                      <span>•</span>
                      <span>{round.scoredMatches}/{round.totalMatches} matches scored</span>
                      {round.motion && (
                        <>
                          <span>•</span>
                          <span className="italic">"{round.motion.substring(0, 50)}{round.motion.length > 50 ? '...' : ''}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`frozen-${round.id}`} className="text-sm">
                        {round.isFrozen ? "Hidden" : "Visible"}
                      </Label>
                      <Switch
                        id={`frozen-${round.id}`}
                        checked={round.isFrozen}
                        onCheckedChange={() => toggleFrozen(round.id, round.isFrozen)}
                        disabled={updating === round.id}
                      />
                    </div>
                    
                    {round.isFrozen ? (
                      <EyeOff className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frozen Rounds Summary */}
      {frozenCount > 0 && (
        <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <EyeOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>{frozenCount} round(s)</strong> are currently frozen and hidden from public leaderboard.
            Participants cannot see scores from these rounds until you unfreeze them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
