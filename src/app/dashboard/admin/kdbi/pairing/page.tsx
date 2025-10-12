"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRequireRoles } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RoundInfo {
  id: string
  stage: string
  roundNumber: number
  session: number
  roundName: string
}

interface TeamOption {
  id: string
  teamName: string
  usedInThisRound: boolean
  members: Array<{ id: string; fullName: string }>
}

interface MatchInfo {
  id: string
  matchNumber: number
  judgeId?: string | null
  judge?: {
    id: string
    name: string
    email: string
  } | null
  teams: Array<{
    id: string
    teamName: string
    members: Array<{ id: string; fullName: string }>
  } | null>
}

interface JudgeOption {
  id: string
  name: string
  email: string
}

export default function KdbiPairingPage() {
  useRequireRoles(["admin"]) // redirect if not admin

  const [stage, setStage] = useState("PRELIMINARY")
  const [roundSession, setRoundSession] = useState("1-1") // Format: "round-session"
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [creatingRooms, setCreatingRooms] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [history, setHistory] = useState<Array<typeof draftAssignments>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null)
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [judges, setJudges] = useState<JudgeOption[]>([])
  const [roomCount, setRoomCount] = useState<number>(2)
  const [motion, setMotion] = useState<string>("")
  const [draftAssignments, setDraftAssignments] = useState<Record<string, { team1Id: string | null, team2Id: string | null, team3Id: string | null, team4Id: string | null }>>({})
  const [draftJudges, setDraftJudges] = useState<Record<string, string | null>>({})

  // Get list of teams already assigned in current round
  const assignedTeamIds = useMemo(() => {
    const ids = new Set<string>()
    matches.forEach(m => {
      m.teams.forEach(t => {
        if (t?.id) ids.add(t.id)
      })
    })
    return ids
  }, [matches])

  const availableTeams = useMemo(() => teams, [teams])

  // Parse round and session from roundSession state
  const [round, session] = roundSession.split('-').map(Number)

  async function loadData() {
    setLoading(true)
    try {
      const [roundRes, judgesRes] = await Promise.all([
        fetch(`/api/admin/kdbi/round-teams?stage=${stage}&round=${round}&session=${session}`),
        fetch('/api/admin/kdbi/judges')
      ])
      
      if (!roundRes.ok) throw new Error(`Failed to load: ${roundRes.status}`)
      const data = await roundRes.json()
      
      if (judgesRes.ok) {
        const judgesData = await judgesRes.json()
        setJudges(judgesData.judges || [])
      }
      
      setRoundInfo(data.round)
      setMatches(data.matches)
      setTeams(data.teams)
      
      // Initialize drafts from fetched matches
      const nextDraft: Record<string, { team1Id: string | null, team2Id: string | null, team3Id: string | null, team4Id: string | null }> = {}
      const nextJudgeDraft: Record<string, string | null> = {}
      
      for (const m of data.matches as MatchInfo[]) {
        const [og, oo, cg, co] = m.teams
        nextDraft[m.id] = {
          team1Id: og?.id ?? null,
          team2Id: oo?.id ?? null,
          team3Id: cg?.id ?? null,
          team4Id: co?.id ?? null,
        }
        nextJudgeDraft[m.id] = m.judgeId || null
      }
      setDraftAssignments(nextDraft)
      setDraftJudges(nextJudgeDraft)
    } catch (e) {
      console.error(e)
      setRoundInfo(null)
      setMatches([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [stage, roundSession])

  useEffect(() => {
    // Set a sensible default per stage, admin can override
    if (stage === 'PRELIMINARY') setRoomCount(2)
    else if (stage === 'SEMIFINAL') setRoomCount(2)
    else if (stage === 'FINAL') setRoomCount(1)
  }, [stage])

  async function createRooms() {
    if (creatingRooms) return // Prevent double click
    
    try {
      setCreatingRooms(true)
      
      const count = Number(roomCount)
      if (!count || count < 1) {
        toast.error('Masukkan jumlah room yang valid (>=1)')
        return
      }
      
      // Check if rooms already exist - handled by separate delete button
      // No auto-delete when creating rooms
      
      const res = await fetch('/api/admin/kdbi/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, roundNumber: round, session, roomCount: count, motion })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat rooms')
      
      toast.success('Rooms berhasil dibuat!')
      await loadData()
      
      // Keep button disabled for 2 seconds after success
      setTimeout(() => setCreatingRooms(false), 2000)
    } catch (e) {
      toast.error((e as Error).message)
      setCreatingRooms(false)
    }
  }

  async function deleteAllRooms() {
    if (!roundInfo?.id) return
    
    try {
      const res = await fetch(`/api/admin/kdbi/delete-rooms?roundId=${roundInfo.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus rooms')
      
      return data
    } catch (e) {
      throw e
    }
  }

  async function saveAllRooms() {
    const unsavedMatches = matches.filter(m => {
      const draft = draftAssignments[m.id]
      if (!draft) return false
      
      // Check if draft is different from current
      const [og, oo, cg, co] = m.teams
      return (
        draft.team1Id !== (og?.id ?? null) ||
        draft.team2Id !== (oo?.id ?? null) ||
        draft.team3Id !== (cg?.id ?? null) ||
        draft.team4Id !== (co?.id ?? null)
      )
    })

    if (unsavedMatches.length === 0) {
      toast.info('Tidak ada perubahan untuk disimpan')
      return
    }

    const confirmed = window.confirm(
      `Simpan assignment untuk ${unsavedMatches.length} room sekaligus?\n\n` +
      `Room: ${unsavedMatches.map(m => m.matchNumber).join(', ')}`
    )
    if (!confirmed) return

    setBulkSaving(true)
    setSaveError(null)
    let successCount = 0
    let failedRooms: number[] = []

    try {
      for (const match of unsavedMatches) {
        try {
          await saveMatch(match.id)
          successCount++
        } catch (e) {
          failedRooms.push(match.matchNumber)
        }
      }

      if (failedRooms.length === 0) {
        toast.success(`Berhasil menyimpan ${successCount} room!`)
      } else {
        toast.warning(
          `Berhasil: ${successCount} room, Gagal: Room ${failedRooms.join(', ')}`
        )
      }
    } finally {
      setBulkSaving(false)
    }
  }

  function openDeleteDialog() {
    if (matches.length === 0) {
      toast.info('Tidak ada room untuk dihapus')
      return
    }
    setShowDeleteDialog(true)
  }

  async function confirmDeleteAllRooms() {
    setShowDeleteDialog(false)
    
    try {
      await deleteAllRooms()
      toast.success('Semua rooms berhasil dihapus!')
      await loadData()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }


  // Add to history when draft changes
  function updateDraftWithHistory(matchId: string, updates: { team1Id?: string | null, team2Id?: string | null, team3Id?: string | null, team4Id?: string | null }) {
    const newDrafts = {
      ...draftAssignments,
      [matchId]: {
        team1Id: updates.team1Id ?? draftAssignments[matchId]?.team1Id ?? null,
        team2Id: updates.team2Id ?? draftAssignments[matchId]?.team2Id ?? null,
        team3Id: updates.team3Id ?? draftAssignments[matchId]?.team3Id ?? null,
        team4Id: updates.team4Id ?? draftAssignments[matchId]?.team4Id ?? null,
      }
    }
    
    // Save to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newDrafts)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setDraftAssignments(newDrafts)
  }

  function undo() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setDraftAssignments(history[historyIndex - 1])
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setDraftAssignments(history[historyIndex + 1])
    }
  }

  async function assignJudge(matchId: string, judgeId: string | null) {
    try {
      const res = await fetch('/api/admin/kdbi/assign-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, judgeId })
      })
      
      if (!res.ok) throw new Error('Failed to assign judge')
      
      // Update local state
      setDraftJudges(prev => ({ ...prev, [matchId]: judgeId }))
      toast.success('Juri berhasil diassign!')
      
    } catch (e) {
      toast.error((e as Error).message)
      throw e
    }
  }

  async function saveMatch(matchId: string, payload?: { team1Id?: string | null, team2Id?: string | null, team3Id?: string | null, team4Id?: string | null }) {
    setSaving(matchId)
    setSaveError(null)
    setSaveSuccess(null)
    
    try {
      const body = payload ?? draftAssignments[matchId]
      if (!body) throw new Error('Tidak ada perubahan untuk disimpan')
      
      // Frontend validation: Check for duplicate teams in same room
      const teamIds = Object.values(body).filter(id => id !== null && id !== undefined)
      const uniqueIds = new Set(teamIds)
      if (teamIds.length !== uniqueIds.size) {
        throw new Error('Tidak boleh assign tim yang sama di posisi berbeda dalam 1 room')
      }
      
      // Frontend validation: Check minimum 2 teams
      if (teamIds.length > 0 && teamIds.length < 2) {
        throw new Error('Minimal harus ada 2 tim (OG dan OO) untuk debate')
      }
      
      const res = await fetch("/api/admin/kdbi/assign-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, ...body })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      
      // Optimistic update: Update local state instead of full reload
      setMatches(prevMatches => 
        prevMatches.map(m => {
          if (m.id === matchId && data.match) {
            // Update with server response
            return {
              ...m,
              teams: [
                data.match.team1 || null,
                data.match.team2 || null,
                data.match.team3 || null,
                data.match.team4 || null
              ]
            }
          }
          return m
        })
      )
      
      // Clear draft for this match
      setDraftAssignments(prev => {
        const newDrafts = { ...prev }
        delete newDrafts[matchId]
        return newDrafts
      })
      
      // Show success feedback (only if not bulk saving)
      if (!bulkSaving) {
        setSaveSuccess(matchId)
        setTimeout(() => setSaveSuccess(null), 3000)
      }
      
    } catch (e) {
      console.error(e)
      if (!bulkSaving) {
        setSaveError((e as Error).message)
        setTimeout(() => setSaveError(null), 5000)
      }
      throw e // Re-throw for bulk save to catch
    } finally {
      setSaving(null)
    }
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Semua Rooms?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p className="font-semibold">
                Anda akan menghapus SEMUA {matches.length} room di {stage} Round {round} Sesi {session}.
              </p>
              <p>
                Semua assignment tim akan hilang dan tidak bisa dikembalikan!
              </p>
              <p className="text-destructive font-medium">
                Apakah Anda yakin ingin melanjutkan?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAllRooms}
            >
              Ya, Hapus Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Atur penempatan tim ke Breakout Room per round. Hanya admin.</p>
      </div>

      {/* Global feedback messages */}
      {saveError && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">❌ {saveError}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Round Selector</CardTitle>
          <CardDescription>Pilih Stage dan Round KDBI yang ingin diatur</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-48">
            <label className="text-sm">Stage</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-64">
            <label className="text-sm">Round & Sesi</label>
            <Select value={roundSession} onValueChange={setRoundSession}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Round & Sesi" />
              </SelectTrigger>
              <SelectContent>
                {stage === 'PRELIMINARY' ? (
                  // Preliminary: Round 1-4, each with Session 1-2
                  [1,2,3,4].map(r => (
                    [1,2].map(s => (
                      <SelectItem key={`${r}-${s}`} value={`${r}-${s}`}>
                        Round {r} Sesi {s}
                      </SelectItem>
                    ))
                  ))
                ) : (
                  // Semifinal & Final: Only rounds, no sessions
                  stage === 'SEMIFINAL' ? (
                    [1,2].map(r => (
                      <SelectItem key={`${r}-1`} value={`${r}-1`}>
                        Round {r}
                      </SelectItem>
                    ))
                  ) : (
                    // Final: Round 1-3
                    [1,2,3].map(r => (
                      <SelectItem key={`${r}-1`} value={`${r}-1`}>
                        Round {r}
                      </SelectItem>
                    ))
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Button variant="outline" onClick={loadData} disabled={loading}>Reload</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {stage === 'PRELIMINARY' ? `Round ${round} - Sesi ${session}` : `Round ${round}`}
              </Badge>
              <Badge variant="outline">{stage}</Badge>
              <span className="text-sm text-muted-foreground">Rooms: {matches.length}</span>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memuat data...</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
              <div className="w-32">
                <label className="text-sm font-medium mb-2 block">Jumlah Room</label>
                <Input
                  type="number"
                  min={1}
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value))}
                  placeholder="Jumlah room"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Mosi Debat <span className="text-destructive">*</span>
                </label>
                <Textarea
                  rows={3}
                  value={motion}
                  onChange={(e) => setMotion(e.target.value)}
                />
                {!motion.trim() && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mosi harus diisi sebelum membuat rooms
                  </p>
                )}
              </div>
              <div className="pt-7 flex gap-2">
                {matches.length === 0 ? (
                  <Button 
                    onClick={createRooms} 
                    size="lg"
                    disabled={creatingRooms || !motion.trim()}
                  >
                    {creatingRooms ? 'Membuat Rooms...' : 'Buat Rooms'}
                  </Button>
                ) : (
                  <Button 
                    onClick={openDeleteDialog} 
                    size="lg" 
                    variant="destructive"
                  >
                    Hapus Semua Rooms
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Memuat data rooms...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Mohon tunggu sebentar
            </p>
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>
              Tidak ada Room untuk {stage} {stage === 'PRELIMINARY' ? `Round ${round} Sesi ${session}` : `Round ${round}`}
            </CardTitle>
            <CardDescription>
              Tentukan jumlah room, lalu klik "Buat Rooms" untuk membuat Breakout Room. Setelah itu, Anda dapat melakukan pairing OG/OO/CG/CO.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {matches.map((m) => {
          const currentIds = draftAssignments[m.id] ?? (() => {
            const [og, oo, cg, co] = m.teams
            return {
              team1Id: og?.id ?? null,
              team2Id: oo?.id ?? null,
              team3Id: cg?.id ?? null,
              team4Id: co?.id ?? null,
            }
          })()

          return (
            <Card key={m.id} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Breakout Room {m.matchNumber}
                </CardTitle>
                <CardDescription>Assign tim dan juri untuk room ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Judge Assignment */}
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <label className="text-sm font-medium mb-2 block">Juri</label>
                  <Select
                    value={draftJudges[m.id] || "__NONE__"}
                    onValueChange={(v) => {
                      const judgeId = v === "__NONE__" ? null : v
                      assignJudge(m.id, judgeId)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih juri..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NONE__">-- Tidak ada juri --</SelectItem>
                      {judges.map(judge => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name || judge.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Team Assignments */}
                {([
                  { label: "OG", key: "team1Id", value: currentIds.team1Id },
                  { label: "OO", key: "team2Id", value: currentIds.team2Id },
                  { label: "CG", key: "team3Id", value: currentIds.team3Id },
                  { label: "CO", key: "team4Id", value: currentIds.team4Id },
                ] as const).map((slot) => (
                  <div className="flex items-center gap-3" key={slot.key}>
                    <div className="w-14 text-sm font-medium">{slot.label}</div>
                    <div className="flex-1">
                      <Select
                        value={(currentIds[slot.key] ?? "__NONE__") as string}
                        onValueChange={(v) => {
                          const mapped = v === "__NONE__" ? null : v
                          updateDraftWithHistory(m.id, {
                            [slot.key]: mapped,
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tim" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">- Kosongkan -</SelectItem>
                          {availableTeams.map(t => {
                            const isAssigned = assignedTeamIds.has(t.id)
                            const isCurrentlySelected = Object.values(currentIds).includes(t.id)
                            const isDisabled = isAssigned && !isCurrentlySelected
                            
                            return (
                              <SelectItem
                                key={t.id}
                                value={t.id}
                                disabled={isDisabled}
                              >
                                {t.teamName} {isDisabled && '(Sudah ditugaskan)'}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    onClick={() => saveMatch(m.id)}
                    disabled={saving === m.id}
                  >
                    {saving === m.id ? "Menyimpan..." : "Simpan Assignment"}
                  </Button>
                  {saveSuccess === m.id && (
                    <span className="text-sm text-green-600 font-medium">
                      ✅ Berhasil disimpan!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}
      </div>
    </>
  )
}
