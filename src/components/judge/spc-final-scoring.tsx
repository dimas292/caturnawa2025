'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Clock,
  Edit,
  CheckCircle,
  User,
  School,
  Calendar,
  Mic,
  Star,
  Trophy,
  Save,
  Users
} from 'lucide-react'

interface SPCFinalist {
  id: string
  participantName: string
  institution: string
  presentationOrder: number
  status: 'waiting' | 'presenting' | 'scored' | 'completed'
  presentationTitle: string
  scheduledTime?: string
}

interface SPCFinalScore {
  participantId: string
  judgeId: string
  judgeName: string
  materi: number // 1-100
  penyampaian: number // 1-100
  bahasa: number // 1-100
  total: number
  feedback?: string
}

interface SPCScoringForm {
  participantId: string
  materi: number
  penyampaian: number
  bahasa: number
  feedback: string
}

interface SPCFinalScoringProps {
  finalists: SPCFinalist[]
  existingScores: SPCFinalScore[]
  judgeName: string
  judgeId: string
  onSubmitScore: (score: SPCFinalScore) => void
}

export default function SPCFinalScoring({
  finalists,
  existingScores,
  judgeName,
  judgeId,
  onSubmitScore
}: SPCFinalScoringProps) {
  const [selectedFinalist, setSelectedFinalist] = useState<SPCFinalist | null>(null)
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const [currentPresenter, setCurrentPresenter] = useState<number | null>(null)
  
  const [scoringForm, setScoringForm] = useState<SPCScoringForm>({
    participantId: '',
    materi: 0,
    penyampaian: 0,
    bahasa: 0,
    feedback: ''
  })

  // Calculate total score automatically
  const totalScore = scoringForm.materi + scoringForm.penyampaian + scoringForm.bahasa

  // Get existing score for a participant
  const getExistingScore = (participantId: string) => {
    return existingScores.find(score => 
      score.participantId === participantId && score.judgeId === judgeId
    )
  }

  // Handle scoring a finalist
  const handleScore = (finalist: SPCFinalist) => {
    const existingScore = getExistingScore(finalist.id)
    
    setSelectedFinalist(finalist)
    setScoringForm({
      participantId: finalist.id,
      materi: existingScore?.materi || 0,
      penyampaian: existingScore?.penyampaian || 0,
      bahasa: existingScore?.bahasa || 0,
      feedback: existingScore?.feedback || ''
    })
    setIsScoringOpen(true)
  }

  // Submit score
  const handleSubmitScore = () => {
    if (!selectedFinalist) return

    // Validation
    if (scoringForm.materi < 1 || scoringForm.materi > 100 ||
        scoringForm.penyampaian < 1 || scoringForm.penyampaian > 100 ||
        scoringForm.bahasa < 1 || scoringForm.bahasa > 100) {
      alert('Semua kriteria harus diisi dengan nilai 1-100')
      return
    }

    const score: SPCFinalScore = {
      participantId: selectedFinalist.id,
      judgeId,
      judgeName,
      materi: scoringForm.materi,
      penyampaian: scoringForm.penyampaian,
      bahasa: scoringForm.bahasa,
      total: totalScore,
      feedback: scoringForm.feedback
    }

    onSubmitScore(score)
    setIsScoringOpen(false)
    setSelectedFinalist(null)
  }

  // Get status badge
  const getStatusBadge = (finalist: SPCFinalist) => {
    const existingScore = getExistingScore(finalist.id)
    
    if (existingScore) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sudah Dinilai</Badge>
    }
    
    switch (finalist.status) {
      case 'waiting':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>
      case 'presenting':
        return <Badge className="bg-blue-100 text-blue-800"><Mic className="w-3 h-3 mr-1" />Sedang Presentasi</Badge>
      case 'completed':
        return <Badge variant="outline"><Trophy className="w-3 h-3 mr-1" />Selesai Presentasi</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Stats calculation
  const stats = {
    totalFinalists: finalists.length,
    scored: finalists.filter(f => getExistingScore(f.id)).length,
    remaining: finalists.filter(f => !getExistingScore(f.id)).length,
    presenting: finalists.filter(f => f.status === 'presenting').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-blue-600 font-medium">
            Juri: {judgeName}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Finalis</p>
                <p className="text-2xl font-bold">{stats.totalFinalists}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Presentasi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.presenting}</p>
              </div>
              <Mic className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Dinilai</p>
                <p className="text-2xl font-bold text-green-600">{stats.scored}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Dinilai</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.remaining}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finalists List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Finalis - Urutan Presentasi</CardTitle>
        </CardHeader>
        <CardContent>
          {finalists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Belum ada finalis yang terdaftar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {finalists
                .sort((a, b) => a.presentationOrder - b.presentationOrder)
                .map((finalist) => {
                  const existingScore = getExistingScore(finalist.id)
                  
                  return (
                    <Card 
                      key={finalist.id} 
                      className={`border-l-4 ${
                        finalist.status === 'presenting' 
                          ? 'border-l-blue-500 bg-blue-50' 
                          : 'border-l-gray-300'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="font-bold">
                                #{finalist.presentationOrder}
                              </Badge>
                              <h3 className="font-semibold text-lg">{finalist.presentationTitle}</h3>
                              {getStatusBadge(finalist)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{finalist.participantName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <span>{finalist.institution}</span>
                              </div>
                            </div>
                            
                            {finalist.scheduledTime && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Calendar className="h-4 w-4" />
                                <span>Jadwal: {finalist.scheduledTime}</span>
                              </div>
                            )}
                            
                            {/* Show existing score summary */}
                            {existingScore && (
                              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-green-800">
                                    Nilai Anda:
                                  </span>
                                  <span className="text-lg font-bold text-green-800">
                                    {existingScore.total}/300
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>Materi: {existingScore.materi}</div>
                                  <div>Penyampaian: {existingScore.penyampaian}</div>
                                  <div>Bahasa: {existingScore.bahasa}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={existingScore ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleScore(finalist)}
                            >
                              {existingScore ? (
                                <>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit Nilai
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-1" />
                                  Beri Nilai
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Dialog */}
      <Dialog open={isScoringOpen} onOpenChange={setIsScoringOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Penilaian Final - {selectedFinalist?.participantName}
            </DialogTitle>
            <DialogDescription>
              Berikan nilai 1-100 untuk setiap kriteria berdasarkan presentasi langsung
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedFinalist && (
              <div className="bg-blue-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{selectedFinalist.presentationTitle}</h4>
                  <Badge variant="outline">#{selectedFinalist.presentationOrder}</Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedFinalist.participantName}</p>
                <p className="text-sm text-gray-600">{selectedFinalist.institution}</p>
              </div>
            )}
            
            {/* Materi (Content) */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  1. Materi (Content) - {scoringForm.materi}/100
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Kedalaman analisis, struktur argumen, relevansi dengan tema, dan kejelasan pesan
                </p>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={scoringForm.materi || ''}
                  onChange={(e) => setScoringForm(prev => ({
                    ...prev,
                    materi: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Nilai 1-100"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Penyampaian (Delivery) */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  2. Penyampaian (Delivery) - {scoringForm.penyampaian}/100
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Penggunaan bahasa tubuh, intonasi suara, kontak mata, dan kepercayaan diri
                </p>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={scoringForm.penyampaian || ''}
                  onChange={(e) => setScoringForm(prev => ({
                    ...prev,
                    penyampaian: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Nilai 1-100"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Bahasa (Language) */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  3. Bahasa (Language) - {scoringForm.bahasa}/100
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Ketepatan tata bahasa, kekayaan kosakata, dan kejelasan artikulasi
                </p>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={scoringForm.bahasa || ''}
                  onChange={(e) => setScoringForm(prev => ({
                    ...prev,
                    bahasa: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Nilai 1-100"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Total Score Display */}
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Skor</p>
                <p className="text-3xl font-bold text-blue-600">{totalScore}/300</p>
                <Progress value={(totalScore / 300) * 100} className="mt-2" />
              </div>
            </div>
            
            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Feedback & Catatan (Opsional)
              </label>
              <Textarea
                placeholder="Berikan feedback untuk peserta..."
                value={scoringForm.feedback}
                onChange={(e) => setScoringForm(prev => ({ ...prev, feedback: e.target.value }))}
                rows={3}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsScoringOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSubmitScore}>
                <Save className="h-4 w-4 mr-1" />
                Simpan Nilai
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}