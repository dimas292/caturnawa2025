'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import DCCUploadForm from '@/components/participant/dcc-upload-form'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Info,
  Image,
  Video,
  Star,
  Trophy,
  User,
  MessageSquare
} from 'lucide-react'

interface DCCUploadClientProps {
  user: any
}

interface DCCScore {
  judgeName: string
  total: number
  feedback?: string
  createdAt: string
  breakdown: any
}

interface SubmissionStatus {
  submitted: boolean
  submittedAt?: string
  status: 'pending' | 'reviewed' | 'qualified' | 'not_qualified'
  feedback?: string
  judulKarya?: string
  deskripsiKarya?: string
  category: 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'
  fileUrl?: string
  qualifiedToFinal?: boolean
  presentationOrder?: number
  semifinal?: {
    scores: DCCScore[]
    averageScore: number
    totalJudges: number
  }
  final?: {
    scores: DCCScore[]
    averageScore: number
    totalJudges: number
  }
}

export default function DCCUploadClient({ user }: DCCUploadClientProps) {
  const [infografisSubmission, setInfografisSubmission] = useState<SubmissionStatus | null>(null)
  const [videoSubmission, setVideoSubmission] = useState<SubmissionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'>('DCC_INFOGRAFIS')
  const [scoresData, setScoresData] = useState<any[]>([])

  // Fetch existing submissions and scores
  useEffect(() => {
    fetchSubmissionStatus()
    fetchScores()
  }, [])

  const fetchSubmissionStatus = async () => {
    try {
      setIsInitialLoading(true)
      const response = await fetch('/api/participant/dcc/submission-status')
      if (response.ok) {
        const data = await response.json()
        setInfografisSubmission(data.infografis || null)
        setVideoSubmission(data.video || null)
      }
    } catch (error) {
      console.error('Error fetching submission status:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/participant/dcc/scores')
      if (response.ok) {
        const data = await response.json()
        setScoresData(data.results || [])
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    }
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    try {
      console.log('=== DCC Upload Debug ===')
      console.log('Category:', activeCategory)
      console.log('Judul:', formData.judulKarya)
      console.log('Deskripsi:', formData.deskripsiKarya?.substring(0, 50))
      console.log('Has File:', !!formData.fileKarya)
      console.log('Has Video Link:', !!formData.videoLink)
      
      const submitData = new FormData()
      submitData.append('judulKarya', formData.judulKarya)
      submitData.append('deskripsiKarya', formData.deskripsiKarya || '')
      submitData.append('category', activeCategory)

      // For DCC_SHORT_VIDEO, send videoLink instead of file
      if (activeCategory === 'DCC_SHORT_VIDEO' && formData.videoLink) {
        submitData.append('videoLink', formData.videoLink)
        console.log('Video Link:', formData.videoLink)
      } else if (formData.fileKarya) {
        submitData.append('fileKarya', formData.fileKarya)
        console.log('File Name:', formData.fileKarya.name)
        console.log('File Size:', formData.fileKarya.size)
        console.log('File Type:', formData.fileKarya.type)
      }

      console.log('Sending request to /api/participant/dcc/upload...')
      const response = await fetch('/api/participant/dcc/upload', {
        method: 'POST',
        body: submitData
      })

      console.log('Response Status:', response.status)
      console.log('Response OK:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Success Response:', result)
        
        const newSubmission = {
          submitted: true,
          submittedAt: new Date().toISOString(),
          status: 'pending' as const,
          judulKarya: formData.judulKarya,
          deskripsiKarya: formData.deskripsiKarya,
          category: activeCategory
        }

        if (activeCategory === 'DCC_INFOGRAFIS') {
          setInfografisSubmission(newSubmission)
        } else {
          setVideoSubmission(newSubmission)
        }

        alert('Karya DCC berhasil disubmit! Menunggu review dari juri.')
        // Refresh scores after submission
        fetchScores()
      } else {
        let errorMessage = 'Gagal mengupload karya'
        try {
          const error = await response.json()
          console.error('Error Response:', error)
          errorMessage = error.error || error.message || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          const textError = await response.text()
          console.error('Error Response Text:', textError)
          errorMessage = `Server error (${response.status}): ${textError.substring(0, 100)}`
        }
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Upload error (catch):', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Gagal mengupload karya'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string, qualified?: boolean) => {
    if (qualified) {
      return <Badge className="bg-green-100 text-green-800"><Trophy className="w-3 h-3 mr-1" />Lolos ke Final</Badge>
    }
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>
      case 'reviewed':
        return <Badge variant="outline">Sudah Direview</Badge>
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Lolos ke Final</Badge>
      case 'not_qualified':
        return <Badge variant="destructive">Tidak Lolos</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderScoreSection = (submission: SubmissionStatus | null, competitionType: string) => {
    if (!submission?.submitted) return null

    const scoreData = scoresData.find(s => s.competitionType === competitionType)
    if (!scoreData) return null

    const isShortVideo = competitionType === 'DCC_SHORT_VIDEO'
    const maxSemifinalScore = isShortVideo ? 1400 : 300
    const maxFinalScore = 400

    return (
      <div className="mt-6 space-y-6">
        <Separator />
        
        {/* Semifinal Scores */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Penilaian Semifinal
            </h3>
            {scoreData.semifinal.totalJudges > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Dinilai oleh {scoreData.semifinal.totalJudges} juri
                </p>
                <p className={`text-2xl font-bold ${getScoreColor(scoreData.semifinal.averageScore, maxSemifinalScore)}`}>
                  {scoreData.semifinal.averageScore} / {maxSemifinalScore}
                </p>
                <p className="text-xs text-gray-500">
                  ({Math.round((scoreData.semifinal.averageScore / maxSemifinalScore) * 100)}%)
                </p>
              </div>
            )}
          </div>

          {scoreData.semifinal.scores.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Belum ada penilaian semifinal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreData.semifinal.scores.map((score: DCCScore, idx: number) => (
                <Card key={idx} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{score.judgeName}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getScoreColor(score.total, maxSemifinalScore)}`}>
                          {score.total}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(score.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {Object.entries(score.breakdown).map(([key, value]) => (
                        <div key={key} className="bg-white p-2 rounded text-center">
                          <p className="text-xs text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-lg font-semibold">{value as number}</p>
                        </div>
                      ))}
                    </div>

                    {score.feedback && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-1">
                              Feedback Juri:
                            </p>
                            <p className="text-sm text-gray-700">{score.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Final Scores */}
        {scoreData.qualifiedToFinal && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Penilaian Final
                </h3>
                {scoreData.final.totalJudges > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Dinilai oleh {scoreData.final.totalJudges} juri
                    </p>
                    <p className={`text-2xl font-bold ${getScoreColor(scoreData.final.averageScore, maxFinalScore)}`}>
                      {scoreData.final.averageScore} / {maxFinalScore}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({Math.round((scoreData.final.averageScore / maxFinalScore) * 100)}%)
                    </p>
                  </div>
                )}
              </div>

              {scoreData.final.scores.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Belum ada penilaian final</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scoreData.final.scores.map((score: DCCScore, idx: number) => (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{score.judgeName}</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${getScoreColor(score.total, maxFinalScore)}`}>
                              {score.total}
                            </p>
                            <p className="text-xs text-gray-500">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(score.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {Object.entries(score.breakdown).map(([key, value]) => (
                            <div key={key} className="bg-white p-2 rounded text-center">
                              <p className="text-xs text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-lg font-semibold">{value as number}</p>
                            </div>
                          ))}
                        </div>

                        {score.feedback && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-1">
                                  Feedback Juri:
                                </p>
                                <p className="text-sm text-gray-700">{score.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  const currentSubmission = activeCategory === 'DCC_INFOGRAFIS' ? infografisSubmission : videoSubmission

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading submission data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 pb-3">
        <div className="container mx-auto py-4 px-4">
          <div className="space-y-3">
            {/* Back Button */}
            <div className="flex justify-start">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Title Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Upload Karya DCC</h1>
                <p className="text-muted-foreground">
                  Digital Content Competition
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">Peserta: {user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Category Selection */}
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="DCC_INFOGRAFIS" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              DCC Infografis
            </TabsTrigger>
            <TabsTrigger value="DCC_SHORT_VIDEO" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              DCC Short Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="DCC_INFOGRAFIS" className="space-y-6">
            {/* Submission Status Card for Infografis */}
            {infografisSubmission?.submitted && (
              <Card className="mb-6 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Status Submission - Infografis
                    </CardTitle>
                    {getStatusBadge(infografisSubmission.status, infografisSubmission.qualifiedToFinal)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Judul Karya:</p>
                        <p className="text-gray-900">{infografisSubmission.judulKarya}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Tanggal Submit:</p>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {infografisSubmission.submittedAt
                            ? new Date(infografisSubmission.submittedAt).toLocaleString('id-ID')
                            : '-'
                          }
                        </p>
                      </div>
                    </div>

                    {infografisSubmission.deskripsiKarya && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Deskripsi:</p>
                        <p className="text-gray-900 text-sm">{infografisSubmission.deskripsiKarya}</p>
                      </div>
                    )}

                    {infografisSubmission.feedback && (
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="font-medium text-blue-900 mb-1">Feedback Juri:</p>
                        <p className="text-blue-800 text-sm">{infografisSubmission.feedback}</p>
                      </div>
                    )}

                    {infografisSubmission.qualifiedToFinal && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Selamat!</strong> Karya infografis Anda lolos ke tahap final. Informasi lebih lanjut akan dikirimkan melalui email.
                        </AlertDescription>
                      </Alert>
                    )}

                    {infografisSubmission.status === 'not_qualified' && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Mohon maaf, karya infografis Anda belum memenuhi kriteria untuk melanjutkan ke tahap final.
                          Terima kasih atas partisipasi Anda.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Scores Section */}
                  {renderScoreSection(infografisSubmission, 'DCC_INFOGRAFIS')}
                </CardContent>
              </Card>
            )}

            {/* Info Card for Infografis */}
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Ketentuan Format DCC Infografis</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Karya berupa infographic statis (bukan video animasi).</li>
                      <li>• Format file JPG / PNG / PDF (maksimal ukuran file: 100 MB).</li>
                      <li>• Ukuran A3 (29.7 x 42 cm) atau rasio 4:5 (Potrait).</li>
                      <li>• Infografis harus: 
                        <ul>
                            <li>• Mengandung data atau informasi akurat.</li>
                            <li>• Mudah dibaca dan dipahami.</li>
                            <li>• Tidak mengandung unsur SARA, pornografi, atau kekerasan.</li>
                        </ul>
                      </li>
                      <li>• Wajib mencantumkan sumber data (jika menggunakan data). Karya orisinal, bukan hasil plagiat, belum pernah  
                      dipublikasikan/menang di lomba lain.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Form for Infografis */}
            <DCCUploadForm
              category="DCC_INFOGRAFIS"
              onSubmit={handleSubmit}
              existingSubmission={infografisSubmission}
              isLoading={isLoading}
              deadline="2025-10-21T23:59:59"
            />
          </TabsContent>

          <TabsContent value="DCC_SHORT_VIDEO" className="space-y-6">
            {/* Submission Status Card for Video */}
            {videoSubmission?.submitted && (
              <Card className="mb-6 border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Status Submission - Short Video
                    </CardTitle>
                    {getStatusBadge(videoSubmission.status, videoSubmission.qualifiedToFinal)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Judul Karya:</p>
                        <p className="text-gray-900">{videoSubmission.judulKarya}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Tanggal Submit:</p>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {videoSubmission.submittedAt
                            ? new Date(videoSubmission.submittedAt).toLocaleString('id-ID')
                            : '-'
                          }
                        </p>
                      </div>
                    </div>

                    {videoSubmission.deskripsiKarya && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Deskripsi:</p>
                        <p className="text-gray-900 text-sm">{videoSubmission.deskripsiKarya}</p>
                      </div>
                    )}

                    {videoSubmission.feedback && (
                      <div className="mt-4 p-3 bg-purple-50 rounded">
                        <p className="font-medium text-purple-900 mb-1">Feedback Juri:</p>
                        <p className="text-purple-800 text-sm">{videoSubmission.feedback}</p>
                      </div>
                    )}

                    {videoSubmission.qualifiedToFinal && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Selamat!</strong> Video Anda lolos ke tahap final. Informasi lebih lanjut akan dikirimkan melalui email.
                        </AlertDescription>
                      </Alert>
                    )}

                    {videoSubmission.status === 'not_qualified' && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Mohon maaf, video Anda belum memenuhi kriteria untuk melanjutkan ke tahap final.
                          Terima kasih atas partisipasi Anda.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Scores Section */}
                  {renderScoreSection(videoSubmission, 'DCC_SHORT_VIDEO')}
                </CardContent>
              </Card>
            )}

            {/* Info Card for Video */}
            <Card className="mb-6 border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Ketentuan Format DCC Short Video</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Karya berupa iklan layanan masyarakat, dengan durasi video minimal 1 menit, maksimal 3 menit.</li>
                      <li>• Format video yang diterima: (MP4 atau MOV, Resolusi 1080 p, maksimal file 1 GB, dan Rasio 9:16 (Potrait)).</li>
                      <li>• Bahasa yang digunakan bebas. Jika menggunakan bahasa daerah/asing, wajib menyertakan subtitle Bahasa Indonesia.</li>
                      <li>• Tidak melanggar hak cipta (musik, footage, dll. Harus bebas lisensi).</li>
                      <li>• Di unggah melalui TikTok dan Link Google Drive yang telah disediakan oleh panitia.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Form for Video */}
            <DCCUploadForm
              category="DCC_SHORT_VIDEO"
              onSubmit={handleSubmit}
              existingSubmission={videoSubmission}
              isLoading={isLoading}
              deadline="2025-10-21T23:59:59"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}