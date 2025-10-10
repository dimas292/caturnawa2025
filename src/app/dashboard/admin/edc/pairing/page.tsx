// src/app/dashboard/admin/edc/pairing/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRequireRoles } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

interface RoundInfo {
  id: string
  stage: string
  roundNumber: number
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
  teams: Array<{
    id: string
    teamName: string
    members: Array<{ id: string; fullName: string }>
  } | null>
}

export default function EdcPairingPage() {
  useRequireRoles(["admin"]) // redirect if not admin

  const [stage, setStage] = useState("PRELIMINARY")
  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null)
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [roomCount, setRoomCount] = useState<number>(3)
  const [motion, setMotion] = useState<string>("")
  const [draftAssignments, setDraftAssignments] = useState<Record<string, { team1Id: string | null, team2Id: string | null, team3Id: string | null, team4Id: string | null }>>({})

  const availableTeams = useMemo(() => teams, [teams])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/edc/round-teams?stage=${stage}&round=${round}`)
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
      const data = await res.json()
      setRoundInfo(data.round)
      setMatches(data.matches)
      setTeams(data.teams)
      // Initialize drafts from fetched matches
      const nextDraft: Record<string, { team1Id: string | null, team2Id: string | null, team3Id: string | null, team4Id: string | null }> = {}
      for (const m of data.matches as MatchInfo[]) {
        const [og, oo, cg, co] = m.teams
        nextDraft[m.id] = {
          team1Id: og?.id ?? null,
          team2Id: oo?.id ?? null,
          team3Id: cg?.id ?? null,
          team4Id: co?.id ?? null,
        }
      }
      setDraftAssignments(nextDraft)
    } catch (e) {
      console.error(e)
      setRoundInfo(null)
      setMatches([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [stage, round])

  useEffect(() => {
    // Set a sensible default per stage, admin can override
    if (stage === 'PRELIMINARY') setRoomCount(3)
    else if (stage === 'SEMIFINAL') setRoomCount(2)
    else if (stage === 'FINAL') setRoomCount(4)
  }, [stage])

  async function createRooms() {
    try {
      const count = Number(roomCount)
      if (!count || count < 1) return alert('Masukkan jumlah room yang valid (>=1)')
      const res = await fetch('/api/admin/edc/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, roundNumber: round, roomCount: count, motion })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat rooms')
      await loadData()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  async function saveMatch(matchId: string, payload?: { team1Id?: string | null, team2Id?: string | null, team3Id?: string | null, team4Id?: string | null }) {
    setSaving(matchId)
    try {
      const body = payload ?? draftAssignments[matchId]
      if (!body) throw new Error('Tidak ada perubahan untuk disimpan')
      const res = await fetch("/api/admin/edc/assign-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, ...body })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      await loadData()
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(null)
    }
  }

  return (
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
        <h1 className="text-2xl font-bold">EDC - Manual Pairing</h1>
        <p className="text-sm text-muted-foreground">Atur penempatan tim ke Breakout Room per round. Hanya admin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Round Selector</CardTitle>
          <CardDescription>Pilih Stage dan Round EDC yang ingin diatur</CardDescription>
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
          <div className="w-48">
            <label className="text-sm">Round</label>
            <Select value={String(round)} onValueChange={(v) => setRound(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Round" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4].map(n => (
                  <SelectItem key={n} value={String(n)}>Round {n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Button variant="outline" onClick={loadData} disabled={loading}>Reload</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary">{roundInfo?.roundName || "No Round"}</Badge>
        <span className="text-sm text-muted-foreground">Rooms: {matches.length}</span>
        {loading && <span className="text-sm">Loading...</span>}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-28"
            min={1}
            value={roomCount}
            onChange={(e) => setRoomCount(Number(e.target.value))}
            placeholder="Jumlah room"
          />
          <Input
            type="text"
            className="w-80"
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
            placeholder="Masukkan mosi untuk round ini..."
          />
          <Button variant="secondary" onClick={createRooms}>Buat Rooms</Button>
        </div>
      </div>

      <Separator />

      {matches.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Tidak ada Room untuk {stage} Round {round}</CardTitle>
            <CardDescription>
              Tentukan jumlah room, lalu klik "Buat Rooms" untuk membuat Breakout Room. Setelah itu, Anda dapat melakukan pairing OG/OO/CG/CO.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
                <CardDescription>Assign tim ke posisi OG/OO/CG/CO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        onValueChange={(val) => {
                          const mapped = val === "__NONE__" ? null : val
                          setDraftAssignments(prev => ({
                            ...prev,
                            [m.id]: {
                              ...(prev[m.id] ?? currentIds),
                              [slot.key]: mapped,
                            }
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tim" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">- Kosongkan -</SelectItem>
                          {availableTeams.map(t => (
                            <SelectItem
                              key={t.id}
                              value={t.id}
                              // we allow selecting teams already used to move them; server validates duplicates across rooms
                            >
                              {t.teamName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Button
                    onClick={() => saveMatch(m.id)}
                    disabled={saving === m.id}
                  >
                    {saving === m.id ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}