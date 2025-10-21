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
  pemaparanMateri: number // 1-100
  pertanyaanJawaban: number // 1-100
  kesesuaianTema: number // 1-100
  catatanPemaparan?: string
  catatanPertanyaan?: string
  catatanKesesuaian?: string
  total: number
  feedback?: string
}

interface SPCScoringForm {
  participantId: string
  pemaparanMateri: number
  pertanyaanJawaban: number
  kesesuaianTema: number
  catatanPemaparan: string
  catatanPertanyaan: string
  catatanKesesuaian: string
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
    pemaparanMateri: 0,
    pertanyaanJawaban: 0,
    kesesuaianTema: 0,
    catatanPemaparan: '',
    catatanPertanyaan: '',
    catatanKesesuaian: '',
    feedback: ''
  })

  // Calculate total score automatically
  const totalScore = scoringForm.pemaparanMateri + scoringForm.pertanyaanJawaban + scoringForm.kesesuaianTema

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
      pemaparanMateri: existingScore?.pemaparanMateri || 0,
      pertanyaanJawaban: existingScore?.pertanyaanJawaban || 0,
      kesesuaianTema: existingScore?.kesesuaianTema || 0,
      catatanPemaparan: existingScore?.catatanPemaparan || '',
      catatanPertanyaan: existingScore?.catatanPertanyaan || '',
      catatanKesesuaian: existingScore?.catatanKesesuaian || '',
      feedback: existingScore?.feedback || ''
    })
    setIsScoringOpen(true)
  }

  // Submit score
  const handleSubmitScore = () => {
    if (!selectedFinalist) return

    // Validation
    if (scoringForm.pemaparanMateri < 1 || scoringForm.pemaparanMateri > 100 ||
        scoringForm.pertanyaanJawaban < 1 || scoringForm.pertanyaanJawaban > 100 ||
        scoringForm.kesesuaianTema < 1 || scoringForm.kesesuaianTema > 100) {
      alert('Semua kriteria harus diisi dengan nilai 1-100')
      return
    }

    const score: SPCFinalScore = {
      participantId: selectedFinalist.id,
      judgeId,
      judgeName,
      pemaparanMateri: scoringForm.pemaparanMateri,
      pertanyaanJawaban: scoringForm.pertanyaanJawaban,
      kesesuaianTema: scoringForm.kesesuaianTema,
      catatanPemaparan: scoringForm.catatanPemaparan,
      catatanPertanyaan: scoringForm.catatanPertanyaan,
      catatanKesesuaian: scoringForm.catatanKesesuaian,
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
                                  <div>Pemaparan: {existingScore.pemaparanMateri}</div>
                                  <div>Q&A: {existingScore.pertanyaanJawaban}</div>
                                  <div>Tema: {existingScore.kesesuaianTema}</div>
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
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {selectedFinalist?.presentationTitle}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Berikan penilaian untuk tiga kriteria utama evaluasi final SPC
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6 py-2">
              {selectedFinalist && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Peserta:</p>
                        <p className="font-semibold text-base">{selectedFinalist.participantName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <School className="h-3.5 w-3.5" />
                          {selectedFinalist.institution}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Urutan Presentasi #{selectedFinalist.presentationOrder}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Pemaparan Materi dan Presentasi Ilmiah */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</span>
                    Pemaparan Materi dan Presentasi Ilmiah
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Kedalaman analisis, struktur presentasi, kejelasan pemaparan, dan kualitas materi ilmiah
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scoringForm.pemaparanMateri || ''}
                    onChange={(e) => setScoringForm(prev => ({
                      ...prev,
                      pemaparanMateri: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Masukkan nilai 0-100"
                    className="w-full text-black"
                  />

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Pemaparan Materi dan Presentasi Ilmiah
                    </label>
                    <Textarea
                      placeholder="Berikan feedback kualitatif untuk pemaparan materi dan presentasi ilmiah..."
                      value={scoringForm.catatanPemaparan}
                      onChange={(e) => setScoringForm(prev => ({ ...prev, catatanPemaparan: e.target.value }))}
                      rows={3}
                      className="mt-2 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pertanyaan dan Jawaban */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-bold">2</span>
                    Pertanyaan dan Jawaban
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Kemampuan menjawab pertanyaan, ketepatan jawaban, dan pemahaman mendalam terhadap materi
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scoringForm.pertanyaanJawaban || ''}
                    onChange={(e) => setScoringForm(prev => ({
                      ...prev,
                      pertanyaanJawaban: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Masukkan nilai 0-100"
                    className="w-full text-black"
                  />

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Pertanyaan dan Jawaban
                    </label>
                    <Textarea
                      placeholder="Berikan feedback kualitatif untuk kemampuan menjawab pertanyaan..."
                      value={scoringForm.catatanPertanyaan}
                      onChange={(e) => setScoringForm(prev => ({ ...prev, catatanPertanyaan: e.target.value }))}
                      rows={3}
                      className="mt-2 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Aspek Kesesuaian Dengan Tema */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">3</span>
                    Aspek Kesesuaian Dengan Tema
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Relevansi karya dengan tema kompetisi, kesesuaian pembahasan, dan kontribusi terhadap tema
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scoringForm.kesesuaianTema || ''}
                    onChange={(e) => setScoringForm(prev => ({
                      ...prev,
                      kesesuaianTema: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Masukkan nilai 0-100"
                    className="w-full text-black"
                  />

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Aspek Kesesuaian Dengan Tema
                    </label>
                    <Textarea
                      placeholder="Berikan feedback kualitatif untuk kesesuaian dengan tema..."
                      value={scoringForm.catatanKesesuaian}
                      onChange={(e) => setScoringForm(prev => ({ ...prev, catatanKesesuaian: e.target.value }))}
                      rows={3}
                      className="mt-2 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </div>
            
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsScoringOpen(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmitScore}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Simpan Nilai
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}