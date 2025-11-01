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
  pemaparanMateriPresentasi: number // 1-100
  pertanyaanJawaban: number // 1-100
  aspekKesesuaianTema: number // 1-100
  catatanPemaparan?: string
  catatanPertanyaan?: string
  catatanKesesuaian?: string
  total: number
  feedback?: string
}

interface SPCScoringForm {
  participantId: string
  pemaparanMateriPresentasi: number
  pertanyaanJawaban: number
  aspekKesesuaianTema: number
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
    pemaparanMateriPresentasi: 0,
    pertanyaanJawaban: 0,
    aspekKesesuaianTema: 0,
    catatanPemaparan: '',
    catatanPertanyaan: '',
    catatanKesesuaian: '',
    feedback: ''
  })

  // Calculate total score automatically
  const totalScore = scoringForm.pemaparanMateriPresentasi + scoringForm.pertanyaanJawaban + scoringForm.aspekKesesuaianTema

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
      pemaparanMateriPresentasi: existingScore?.pemaparanMateriPresentasi || 0,
      pertanyaanJawaban: existingScore?.pertanyaanJawaban || 0,
      aspekKesesuaianTema: existingScore?.aspekKesesuaianTema || 0,
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
    if (scoringForm.pemaparanMateriPresentasi < 1 || scoringForm.pemaparanMateriPresentasi > 100 ||
      scoringForm.pertanyaanJawaban < 1 || scoringForm.pertanyaanJawaban > 100 ||
      scoringForm.aspekKesesuaianTema < 1 || scoringForm.aspekKesesuaianTema > 100) {
      alert('Semua kriteria harus diisi dengan nilai 1-100')
      return
    }

    const score: SPCFinalScore = {
      participantId: selectedFinalist.id,
      judgeId,
      judgeName,
      pemaparanMateriPresentasi: scoringForm.pemaparanMateriPresentasi,
      pertanyaanJawaban: scoringForm.pertanyaanJawaban,
      aspekKesesuaianTema: scoringForm.aspekKesesuaianTema,
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

  const getScoreInput = (score: number, onChange: (score: number) => void, label: string) => {
    return (
      <div className="space-y-2">
        <input
          type="number"
          min="0"
          max="100"
          value={score || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="Masukkan nilai 0-100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>
    )
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
          <p className="text-gray-600 mt-1">
            Penilaian presentasi final peserta yang lolos semifinal
          </p>
          <h3 className="text-sm text-blue-600 font-medium mt-1">
            Juri: {judgeName}
          </h3>
        </div>
      </div>

      {/* Finalists List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Finalis</CardTitle>
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
                  const allScoresForFinalist = existingScores.filter(score => score.participantId === finalist.id)

                  return (
                    <Card
                      key={finalist.id}
                      className={`border-l-4 ${finalist.status === 'presenting'
                        ? 'border-l-blue-500 bg-blue-50'
                        : 'border-l-blue-500'
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

                            {/* Show judges info if any have scored */}
                            {allScoresForFinalist.length > 0 && (
                              <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 mb-1">
                                  Juri yang sudah menilai ({allScoresForFinalist.length}/3):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {allScoresForFinalist.map((score, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {score.judgeName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{finalist.participantName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <span>{finalist.institution}</span>
                              </div>
                              {finalist.scheduledTime && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{finalist.scheduledTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Show all qualitative feedbacks */}
                            {existingScore && (existingScore.catatanPemaparan || existingScore.catatanPertanyaan || existingScore.catatanKesesuaian) && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                                {existingScore.catatanPemaparan && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Catatan Pemaparan:</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {existingScore.catatanPemaparan}
                                    </p>
                                  </div>
                                )}
                                {existingScore.catatanPertanyaan && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Catatan Q&A:</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {existingScore.catatanPertanyaan}
                                    </p>
                                  </div>
                                )}
                                {existingScore.catatanKesesuaian && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Catatan Kesesuaian Tema:</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {existingScore.catatanKesesuaian}
                                    </p>
                                  </div>
                                )}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 1. Pemaparan Materi dan Presentasi Ilmiah */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</span>
                    Pemaparan Materi dan Presentasi Ilmiah
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Penilaian terhadap kualitas pemaparan materi dan kemampuan presentasi
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  {getScoreInput(
                    scoringForm.pemaparanMateriPresentasi,
                    (score) => setScoringForm(prev => ({ ...prev, pemaparanMateriPresentasi: score })),
                    'Pemaparan Materi dan Presentasi Ilmiah'
                  )}

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Catatan Pemaparan
                    </label>
                    <Textarea
                      placeholder="Berikan feedback kualitatif untuk pemaparan materi dan presentasi..."
                      value={scoringForm.catatanPemaparan}
                      onChange={(e) => setScoringForm(prev => ({ ...prev, catatanPemaparan: e.target.value }))}
                      rows={3}
                      className="mt-2 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Pertanyaan dan Jawaban */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-bold">2</span>
                    Pertanyaan dan Jawaban
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Kemampuan menjawab pertanyaan dengan jelas, akurat, dan komprehensif
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  {getScoreInput(
                    scoringForm.pertanyaanJawaban,
                    (score) => setScoringForm(prev => ({ ...prev, pertanyaanJawaban: score })),
                    'Pertanyaan dan Jawaban'
                  )}

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Catatan Q&A
                    </label>
                    <Textarea
                      placeholder="Berikan feedback kualitatif untuk sesi tanya jawab..."
                      value={scoringForm.catatanPertanyaan}
                      onChange={(e) => setScoringForm(prev => ({ ...prev, catatanPertanyaan: e.target.value }))}
                      rows={3}
                      className="mt-2 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 3. Aspek Kesesuaian Dengan Tema */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">3</span>
                    Aspek Kesesuaian Dengan Tema
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Relevansi dan kesesuaian materi presentasi dengan tema yang ditentukan
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Nilai Kuantitatif (0-100)
                    </label>
                  </div>
                  {getScoreInput(
                    scoringForm.aspekKesesuaianTema,
                    (score) => setScoringForm(prev => ({ ...prev, aspekKesesuaianTema: score })),
                    'Aspek Kesesuaian Dengan Tema'
                  )}

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Nilai Kualitatif - Catatan Kesesuaian Tema
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

              {/* Info tentang ranking otomatis */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Sistem Ranking Otomatis</p>
                      <p className="text-sm text-blue-700 mt-1.5 leading-relaxed">
                        Pemenang akan ditentukan otomatis berdasarkan ranking dari total nilai final.
                        <strong> 3 peserta dengan nilai tertinggi</strong> akan menjadi juara 1, 2, dan 3.
                      </p>
                    </div>
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
              Simpan Penilaian
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}