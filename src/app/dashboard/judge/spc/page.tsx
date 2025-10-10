"use client"

import { useRequireRoles } from "@/hooks/use-auth"
import { LoadingPage } from "@/components/ui/loading"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SPCSemifinalEvaluation from "@/components/judge/spc-semifinal-evaluation"
import SPCFinalScoring from "@/components/judge/spc-final-scoring"

export default function SPCJudgePage() {
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const [spcStage, setSpcStage] = useState<'semifinal' | 'final'>('semifinal')
  const [spcSubmissions, setSpcSubmissions] = useState<any[]>([])
  const [spcFinalists, setSpcFinalists] = useState<any[]>([])
  const [spcScores, setSpcScores] = useState<any[]>([])
  const [isSpcLoading, setIsSpcLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSPCData()
    }
  }, [user, spcStage])

  const fetchSPCData = async () => {
    setIsSpcLoading(true)
    try {
      if (spcStage === 'semifinal') {
        const response = await fetch('/api/judge/spc/submissions')
        if (response.ok) {
          const data = await response.json()
          setSpcSubmissions(data.submissions || [])
        } else {
          setSpcSubmissions([])
        }
      } else if (spcStage === 'final') {
        const [finalistsRes, scoresRes] = await Promise.all([
          fetch('/api/judge/spc/finalists'),
          fetch('/api/judge/spc/scores')
        ])

        if (finalistsRes.ok) {
          const finalistsData = await finalistsRes.json()
          setSpcFinalists(finalistsData.finalists || [])
        } else {
          setSpcFinalists([])
        }

        if (scoresRes.ok) {
          const scoresData = await scoresRes.json()
          setSpcScores(scoresData.scores || [])
        } else {
          setSpcScores([])
        }
      }
    } catch (error) {
      console.error('Error fetching SPC data:', error)
      setSpcSubmissions([])
      setSpcFinalists([])
      setSpcScores([])
    } finally {
      setIsSpcLoading(false)
    }
  }

  const handleSPCEvaluate = async (evaluation: any) => {
    try {
      const response = await fetch('/api/judge/spc/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation)
      })

      if (response.ok) {
        await fetchSPCData()
        alert('Evaluasi berhasil disimpan')
      } else {
        alert('Error menyimpan evaluasi')
      }
    } catch (error) {
      console.error('Error evaluating SPC:', error)
      alert('Error menyimpan evaluasi')
    }
  }

  const handleSPCDownload = (submissionId: string) => {
    const downloadUrl = `/api/judge/spc/download/${submissionId}`
    window.open(downloadUrl, '_blank')
  }

  const handleSPCScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/spc/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })

      if (response.ok) {
        setSpcScores(prev => [...prev.filter(s => s.participantId !== score.participantId), score])
        alert('Nilai berhasil disimpan')
      } else {
        alert('Error menyimpan nilai')
      }
    } catch (error) {
      console.error('Error scoring SPC:', error)
      alert('Error menyimpan nilai')
    }
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          SPC - Speech Competition
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistem penilaian untuk Speech Competition dengan dua tahap: Semifinal (Karya Tertulis) dan Final (Presentasi Langsung)
        </p>
      </div>

      {/* Stage Selection */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={spcStage === "semifinal" ? "default" : "outline"}
          onClick={() => setSpcStage("semifinal")}
          disabled={isSpcLoading}
        >
          Semifinal (Karya Tertulis)
        </Button>
        <Button
          variant={spcStage === "final" ? "default" : "outline"}
          onClick={() => setSpcStage("final")}
          disabled={isSpcLoading}
        >
          Final (Presentasi Langsung)
        </Button>
      </div>

      {/* Loading State */}
      {isSpcLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading SPC data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SPC Content based on stage */}
      {!isSpcLoading && spcStage === 'semifinal' && (
        <SPCSemifinalEvaluation
          submissions={spcSubmissions}
          onEvaluate={handleSPCEvaluate}
          onDownload={handleSPCDownload}
        />
      )}

      {!isSpcLoading && spcStage === 'final' && (
        <SPCFinalScoring
          finalists={spcFinalists}
          existingScores={spcScores}
          judgeName={user?.name || 'Judge'}
          judgeId={user?.id || 'unknown'}
          onSubmitScore={handleSPCScore}
        />
      )}
    </div>
  )
}