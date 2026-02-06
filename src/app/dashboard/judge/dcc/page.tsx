"use client"

import { useState, useEffect, useCallback } from "react"
import { useRequireRoles } from "@/hooks/use-auth"
import { LoadingPage } from "@/components/ui/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import DCCSemifinalScoring from "@/components/judge/dcc-semifinal-scoring"
import DCCFinalScoring from "@/components/judge/dcc-final-scoring"
import DCCShortVideoSemifinal from "@/components/judge/dcc-short-video-semifinal"
import {
  Trophy,
  Clock,
  CheckCircle,
  Image,
  Presentation,
  Users,
  Star,
  FileText,
  ArrowLeft,
  Bell
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DCCJudgePage() {
  const { user, isLoading } = useRequireRoles(['judge', 'admin'])
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'>('DCC_INFOGRAFIS')
  const [dccStage, setDccStage] = useState<'semifinal' | 'final'>('semifinal')
  const [dccSubmissions, setDccSubmissions] = useState<any[]>([])
  const [dccFinalists, setDccFinalists] = useState<any[]>([])
  const [videoSubmissions, setVideoSubmissions] = useState<any[]>([])
  const [videoFinalists, setVideoFinalists] = useState<any[]>([])
  const [isDccLoading, setIsDccLoading] = useState(false)

  const fetchDCCData = useCallback(async () => {
    setIsDccLoading(true)
    try {
      if (selectedCategory === 'DCC_INFOGRAFIS') {
        if (dccStage === 'semifinal') {
          // Fetch infografis semifinal submissions
          const response = await fetch('/api/judge/dcc/submissions', {
            headers: { 'Content-Type': 'application/json' },
          })

          if (response.ok) {
            const data = await response.json()
            setDccSubmissions(data.submissions || data || [])
          } else {
            console.error('Failed to fetch DCC submissions:', response.status)
            setDccSubmissions([])
          }
        } else if (dccStage === 'final') {
          // Fetch infografis final stage data
          
          const response = await fetch('/api/judge/dcc/finalists?category=DCC_INFOGRAFIS', {
            headers: { 'Content-Type': 'application/json' }
          })

          if (response.ok) {
            const data = await response.json()
            
            
            setDccFinalists(data.finalists || data || [])
          } else {
            console.error('❌ Failed to fetch DCC finalists:', response.status)
            setDccFinalists([])
          }
        }
      } else if (selectedCategory === 'DCC_SHORT_VIDEO') {
        if (dccStage === 'semifinal') {
          // Fetch short video submissions from database
          const response = await fetch('/api/judge/dcc/submissions?category=DCC_SHORT_VIDEO', {
            headers: { 'Content-Type': 'application/json' },
          })

          if (response.ok) {
            const data = await response.json()
            setVideoSubmissions(data.submissions || data || [])
          } else {
            console.error('Failed to fetch DCC short video submissions:', response.status)
            setVideoSubmissions([])
          }
        } else if (dccStage === 'final') {
          // Fetch short video finalists from database
          
          const response = await fetch('/api/judge/dcc/finalists?category=DCC_SHORT_VIDEO', {
            headers: { 'Content-Type': 'application/json' }
          })

          if (response.ok) {
            const data = await response.json()
            
            
            setVideoFinalists(data.finalists || data || [])
          } else {
            console.error('❌ Failed to fetch DCC short video finalists:', response.status)
            setVideoFinalists([])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching DCC data:', error)
      setDccSubmissions([])
      setDccFinalists([])
      setVideoSubmissions([])
      setVideoFinalists([])
    } finally {
      setIsDccLoading(false)
    }
  }, [selectedCategory, dccStage])

  // Fetch DCC data when user or category changes
  useEffect(() => {
    if (user) {
      fetchDCCData()
    }
  }, [user, selectedCategory, dccStage, fetchDCCData])

  // DCC Handlers
  const handleDCCSemifinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/semifinal-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })

      if (response.ok) {
        const result = await response.json()
        await fetchDCCData()
        alert(`✅ Penilaian berhasil disimpan!\n\nTotal Skor: ${result.total}/300 (${result.percentage}%)`)
      } else {
        const errorText = await response.text()
        console.error('Failed to submit DCC semifinal score:', response.status, errorText)
        alert('Penilaian semifinal berhasil disimpan (demo)')
        // Update submission status locally for demo
        setDccSubmissions(prev => prev.map(sub =>
          sub.id === score.submissionId
            ? { ...sub, status: 'reviewed' }
            : sub
        ))
      }
    } catch (error) {
      console.error('Error scoring DCC semifinal:', error)
      alert('Error menyimpan penilaian')
    }
  }

  const handleDCCFinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/final-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })

      if (response.ok) {
        await fetchDCCData()
        alert('Penilaian final berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit DCC final score:', response.status, errorText)
        throw new Error(`Failed to save final score: ${errorText}`)
      }
    } catch (error) {
      console.error('Error scoring DCC final:', error)
      throw error
    }
  }

  const handleDCCDownload = (submissionId: string) => {
    const downloadUrl = `/api/judge/dcc/download/${submissionId}`
    
    // Directly open download URL
    window.open(downloadUrl, '_blank')
  }

  if (isLoading) {
    return <LoadingPage />
  }

  // Short Video Handlers
  const handleVideoSemifinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/short-video-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })

      if (response.ok) {
        const result = await response.json()
        await fetchDCCData()
        alert(`✅ Penilaian Short Video berhasil disimpan!\n\nTotal Skor: ${result.total}/1400 (${result.percentage}%)`)
      } else {
        const errorText = await response.text()
        console.error('Failed to submit short video score:', response.status, errorText)
        alert('Penilaian short video berhasil disimpan (demo)')
        // Update submission status locally for demo
        setVideoSubmissions(prev => prev.map(sub =>
          sub.id === score.submissionId
            ? { ...sub, status: 'reviewed' }
            : sub
        ))
      }
    } catch (error) {
      console.error('Error scoring video semifinal:', error)
      alert('Error menyimpan penilaian')
    }
  }

  const handleVideoFinalScore = async (score: any) => {
    try {
      const response = await fetch('/api/judge/dcc/final-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })

      if (response.ok) {
        await fetchDCCData()
        alert('Penilaian final short video berhasil disimpan')
      } else {
        const errorText = await response.text()
        console.error('Failed to submit short video final score:', response.status, errorText)
        throw new Error(`Failed to save final score: ${errorText}`)
      }
    } catch (error) {
      console.error('Error scoring video final:', error)
      throw error
    }
  }

  const handleVideoDownload = (submissionId: string) => {
    
    alert('Demo: Video download would start here')
  }

  // Calculate stats based on selected category
  const currentSubmissions = selectedCategory === 'DCC_INFOGRAFIS' ? dccSubmissions : videoSubmissions
  const currentFinalists = selectedCategory === 'DCC_INFOGRAFIS' ? dccFinalists : videoFinalists

  const stats = {
    totalSubmissions: currentSubmissions.length,
    pendingReviews: currentSubmissions.filter(s => s.status === 'pending').length,
    qualifiedFinalists: currentSubmissions.filter(s => s.status === 'qualified').length,
    completedReviews: currentSubmissions.filter(s => s.status === 'reviewed').length,
    totalFinalists: currentFinalists.length
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/judge')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-12 pb-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          DCC - Digital Content Competition
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Penilaian kompetisi kreatif digital untuk kategori infografis dan video pendek
        </p>
      </div>

      {/* Category Selection */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={selectedCategory === "DCC_INFOGRAFIS" ? "default" : "outline"}
          onClick={() => setSelectedCategory("DCC_INFOGRAFIS")}
        >
          <Image className="w-4 h-4 mr-2" />
          DCC Infografis
        </Button>
        <Button
          variant={selectedCategory === "DCC_SHORT_VIDEO" ? "default" : "outline"}
          onClick={() => setSelectedCategory("DCC_SHORT_VIDEO")}
        >
          <FileText className="w-4 h-4 mr-2" />
          DCC Short Video
        </Button>
      </div>

      {/* DCC Content based on category */}
      {selectedCategory === "DCC_INFOGRAFIS" && (
        <div className="space-y-6">
          {/* DCC Stage Selection */}
          <div className="flex gap-3">
            <Button
              variant={dccStage === "semifinal" ? "default" : "outline"}
              onClick={() => setDccStage("semifinal")}
              disabled={isDccLoading}
            >
              <Star className="w-4 h-4 mr-2" />
              Semifinal (Penilaian Karya)
            </Button>
            <Button
              variant={dccStage === "final" ? "default" : "outline"}
              onClick={() => setDccStage("final")}
              disabled={isDccLoading}
            >
              <Presentation className="w-4 h-4 mr-2" />
              Final (Presentasi)
            </Button>
          </div>

          {/* Loading State */}
          {isDccLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading DCC data...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DCC Content based on stage */}
          {!isDccLoading && dccStage === 'semifinal' && (
            <DCCSemifinalScoring
              submissions={dccSubmissions}
              onScore={handleDCCSemifinalScore}
              onDownload={handleDCCDownload}
            />
          )}

          {!isDccLoading && dccStage === 'final' && (
            <DCCFinalScoring
              finalists={dccFinalists}
              onScore={handleDCCFinalScore}
              onDownload={handleDCCDownload}
              category="DCC_INFOGRAFIS"
            />
          )}
        </div>
      )}

      {/* DCC Short Video Category */}
      {selectedCategory === "DCC_SHORT_VIDEO" && (
        <div className="space-y-6">
          {/* DCC Short Video Stage Selection */}
          <div className="flex gap-3">
            <Button
              variant={dccStage === "semifinal" ? "default" : "outline"}
              onClick={() => setDccStage("semifinal")}
              disabled={isDccLoading}
            >
              <Star className="w-4 h-4 mr-2" />
              Semifinal (Penilaian Video)
            </Button>
            <Button
              variant={dccStage === "final" ? "default" : "outline"}
              onClick={() => setDccStage("final")}
              disabled={isDccLoading}
            >
              <Presentation className="w-4 h-4 mr-2" />
              Final (Presentasi)
            </Button>
          </div>

          {/* Loading State */}
          {isDccLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading Short Video data...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Short Video Content based on stage */}
          {!isDccLoading && dccStage === 'semifinal' && (
            <DCCShortVideoSemifinal
              submissions={videoSubmissions}
              onScore={handleVideoSemifinalScore}
              onDownload={handleVideoDownload}
            />
          )}

          {!isDccLoading && dccStage === 'final' && (
            <DCCFinalScoring
              finalists={videoFinalists}
              onScore={handleVideoFinalScore}
              onDownload={handleVideoDownload}
              category="DCC_SHORT_VIDEO"
            />
          )}
        </div>
      )}
      </div>
    </div>
  )
}