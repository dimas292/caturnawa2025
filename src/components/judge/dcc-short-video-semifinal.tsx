'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Download,
  Eye,
  Check,
  X,
  Clock,
  User,
  School,
  Calendar,
  Star,
  Video,
  Play
} from 'lucide-react'

interface DCCVideoSubmission {
  id: string
  participantName: string
  institution: string
  submissionTitle: string
  submittedAt: string
  fileUrl: string
  fileName: string
  fileSize: string
  youtubeUrl?: string
  status: 'pending' | 'reviewed' | 'qualified' | 'not_qualified'
  notes?: string
  deskripsiVideo?: string
  duration?: string
  judgesCount?: number
  currentJudgeHasScored?: boolean
  canBeScored?: boolean
  allJudges?: Array<{
    judgeId: string
    judgeName: string
  }>
}

interface DCCVideoSemifinalScore {
  submissionId: string
  // Sinematografi
  angleShot: number // 1-100 score (40%)
  komposisiGambar: number // 1-100 score (30%)
  kualitasGambar: number // 1-100 score (30%)
  // Visual dan Bentuk
  pilihanWarna: number // 1-100 score (25%)
  tataKostum: number // 1-100 score (25%)
  propertiLatar: number // 1-100 score (25%)
  kesesuaianSetting: number // 1-100 score (25%)
  // Visual dan Editing
  kerapianTransisi: number // 1-100 score (25%)
  ritmePemotongan: number // 1-100 score (25%)
  sinkronisasiAudio: number // 1-100 score (25%)
  kreativitasEfek: number // 1-100 score (25%)
  // Isi/Pesan
  kesesuaianTema: number // 1-100 score (20%)
  kedalamanIsi: number // 1-100 score (40%)
  dayaTarik: number // 1-100 score (40%)
  feedback: string
}

interface DCCVideoSemifinalScoringProps {
  submissions: DCCVideoSubmission[]
  onScore: (score: DCCVideoSemifinalScore) => Promise<void>
  onDownload: (submissionId: string) => void
}

export default function DCCShortVideoSemifinal({
  submissions,
  onScore,
  onDownload
}: DCCVideoSemifinalScoringProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<DCCVideoSubmission | null>(null)
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [scoringForm, setScoringForm] = useState<DCCVideoSemifinalScore>({
    submissionId: '',
    // Sinematografi
    angleShot: 0,
    komposisiGambar: 0,
    kualitasGambar: 0,
    // Visual dan Bentuk
    pilihanWarna: 0,
    tataKostum: 0,
    propertiLatar: 0,
    kesesuaianSetting: 0,
    // Visual dan Editing
    kerapianTransisi: 0,
    ritmePemotongan: 0,
    sinkronisasiAudio: 0,
    kreativitasEfek: 0,
    // Isi/Pesan
    kesesuaianTema: 0,
    kedalamanIsi: 0,
    dayaTarik: 0,
    feedback: ''
  })

  const handleScore = (submission: DCCVideoSubmission) => {
    setSelectedSubmission(submission)
    setScoringForm({
      submissionId: submission.id,
      // Sinematografi
      angleShot: 0,
      komposisiGambar: 0,
      kualitasGambar: 0,
      // Visual dan Bentuk
      pilihanWarna: 0,
      tataKostum: 0,
      propertiLatar: 0,
      kesesuaianSetting: 0,
      // Visual dan Editing
      kerapianTransisi: 0,
      ritmePemotongan: 0,
      sinkronisasiAudio: 0,
      kreativitasEfek: 0,
      // Isi/Pesan
      kesesuaianTema: 0,
      kedalamanIsi: 0,
      dayaTarik: 0,
      feedback: ''
    })
    setIsScoringOpen(true)
  }

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return

    // Validation for all sub-criteria
    const scores = [
      scoringForm.angleShot, scoringForm.komposisiGambar, scoringForm.kualitasGambar,
      scoringForm.pilihanWarna, scoringForm.tataKostum, scoringForm.propertiLatar, scoringForm.kesesuaianSetting,
      scoringForm.kerapianTransisi, scoringForm.ritmePemotongan, scoringForm.sinkronisasiAudio, scoringForm.kreativitasEfek,
      scoringForm.kesesuaianTema, scoringForm.kedalamanIsi, scoringForm.dayaTarik
    ]

    for (const score of scores) {
      if (score < 1 || score > 100) {
        alert('Harap berikan nilai 1-100 untuk semua sub-kriteria')
        return
      }
    }

    if (!scoringForm.feedback.trim()) {
      alert('Harap berikan feedback untuk peserta')
      return
    }

    try {
      await onScore(scoringForm)
      setIsScoringOpen(false)
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Error submitting score:', error)
      alert('Terjadi kesalahan saat menyimpan penilaian. Silakan coba lagi.')
    }
  }

  const getScoreInput = (score: number, onChange: (score: number) => void) => {
    return (
      <div className="space-y-2">
        <input
          type="number"
          min="1"
          max="100"
          value={score || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="Masukkan nilai 1-100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>
    )
  }

  const getStatusBadge = (status: string, judgesCount?: number) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Penilaian</Badge>
      case 'reviewed':
        const count = judgesCount || 0
        return (
          <Badge variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            Sudah Dinilai ({count}/3 Juri)
          </Badge>
        )
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />🎉 Lolos ke Final</Badge>
      case 'not_qualified':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />❌ Tidak Lolos</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true
    return submission.status === filterStatus
  })

  // Calculate weighted scores according to rubric
  const sinematografiTotal = Math.round(
    (scoringForm.angleShot * 0.4) +
    (scoringForm.komposisiGambar * 0.3) +
    (scoringForm.kualitasGambar * 0.3)
  )

  const visualBentukTotal = Math.round(
    (scoringForm.pilihanWarna * 0.25) +
    (scoringForm.tataKostum * 0.25) +
    (scoringForm.propertiLatar * 0.25) +
    (scoringForm.kesesuaianSetting * 0.25)
  )

  const visualEditingTotal = Math.round(
    (scoringForm.kerapianTransisi * 0.25) +
    (scoringForm.ritmePemotongan * 0.25) +
    (scoringForm.sinkronisasiAudio * 0.25) +
    (scoringForm.kreativitasEfek * 0.25)
  )

  const isiPesanTotal = Math.round(
    (scoringForm.kesesuaianTema * 0.2) +
    (scoringForm.kedalamanIsi * 0.4) +
    (scoringForm.dayaTarik * 0.4)
  )

  const totalScore = sinematografiTotal + visualBentukTotal + visualEditingTotal + isiPesanTotal
  const percentageScore = Math.round((totalScore / 400) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">DCC Short Video</h2>
          <p className="text-gray-600 mt-1">
            Penilaian video pendek peserta untuk tahap semifinal dengan rubrik terstruktur
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Penilaian</SelectItem>
              <SelectItem value="reviewed">Sudah Dinilai</SelectItem>
              <SelectItem value="qualified">Lolos ke Final</SelectItem>
              <SelectItem value="not_qualified">Tidak Lolos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Video Pendek</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Tidak ada video ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{submission.submissionTitle}</h3>
                          {getStatusBadge(submission.status, submission.judgesCount)}
                        </div>
                        
                        {/* Show judges info if any have scored */}
                        {submission.judgesCount && submission.judgesCount > 0 && (
                          <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              Juri yang sudah menilai ({submission.judgesCount}/3):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {submission.allJudges?.map((judge, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {judge.judgeName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{submission.participantName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4" />
                            <span>{submission.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>{submission.fileName}</span>
                          <span>{submission.fileSize}</span>
                          {submission.duration && <span>Durasi: {submission.duration}</span>}
                        </div>

                        {submission.deskripsiVideo && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Deskripsi:</strong> {submission.deskripsiVideo}
                          </div>
                        )}

                      </div>

                      <div className="flex gap-2">
                        {submission.youtubeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.youtubeUrl, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Tonton Video
                          </Button>
                        )}
                        
                        {submission.canBeScored ? (
                          <Button
                            size="sm"
                            onClick={() => handleScore(submission)}
                            variant={submission.currentJudgeHasScored ? "outline" : "default"}
                            className={submission.currentJudgeHasScored ? "" : "bg-red-600 hover:bg-red-700"}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {submission.currentJudgeHasScored ? "Edit Nilai" : "Nilai"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            Maksimal 3 Juri
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Dialog */}
      <Dialog open={isScoringOpen} onOpenChange={setIsScoringOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {selectedSubmission?.submissionTitle}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Berikan penilaian untuk empat kriteria utama evaluasi semifinal DCC Short Video
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6 py-2">
              {selectedSubmission && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Peserta:</p>
                        <p className="font-semibold text-base">{selectedSubmission.participantName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <School className="h-3.5 w-3.5" />
                          {selectedSubmission.institution}
                        </p>
                        {selectedSubmission.youtubeUrl && (
                          <a
                            href={selectedSubmission.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            <Play className="h-4 w-4" />
                            Lihat Karya di YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* KRITERIA 1: SINEMATOGRAFI */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 1: SINEMATOGRAFI (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 1.1 Angle Shot */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.1 Angle Shot (Bobot: 40%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: pemilihan sudut kamera, variasi shot: wide, close-up, over-the-shoulder, dll.
                </p>
                {getScoreInput(
                  scoringForm.angleShot,
                  (score) => setScoringForm(prev => ({ ...prev, angleShot: score })),
                  'Angle Shot'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.angleShot} × 0.4 = {(scoringForm.angleShot * 0.4).toFixed(1)}
                </div>
              </div>

              {/* 1.2 Komposisi Gambar */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.2 Komposisi Gambar (Bobot: 30%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: aturan rule of thirds, fokus visual, framing
                </p>
                {getScoreInput(
                  scoringForm.komposisiGambar,
                  (score) => setScoringForm(prev => ({ ...prev, komposisiGambar: score })),
                  'Komposisi Gambar'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.komposisiGambar} × 0.3 = {(scoringForm.komposisiGambar * 0.3).toFixed(1)}
                </div>
              </div>

              {/* 1.3 Kualitas Gambar */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.3 Kualitas Gambar (Bobot: 30%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: kejernihan, cahaya, resolusi, noise
                </p>
                {getScoreInput(
                  scoringForm.kualitasGambar,
                  (score) => setScoringForm(prev => ({ ...prev, kualitasGambar: score })),
                  'Kualitas Gambar'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kualitasGambar} × 0.3 = {(scoringForm.kualitasGambar * 0.3).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Sinematografi = {sinematografiTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* KRITERIA 2: VISUAL DAN BENTUK */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 2: VISUAL DAN BENTUK (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 2.1 Pemilihan warna */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  2.1 Pemilihan warna (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: palet warna, kontras, mood visual
                </p>
                {getScoreInput(
                  scoringForm.pilihanWarna,
                  (score) => setScoringForm(prev => ({ ...prev, pilihanWarna: score })),
                  'Pemilihan warna'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.pilihanWarna} × 0.25 = {(scoringForm.pilihanWarna * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 2.2 Tata Kostum */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  2.2 Tata Kostum (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: sesuai karakter, tema, konteks
                </p>
                {getScoreInput(
                  scoringForm.tataKostum,
                  (score) => setScoringForm(prev => ({ ...prev, tataKostum: score })),
                  'Tata Kostum'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.tataKostum} × 0.25 = {(scoringForm.tataKostum * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 2.3 Penggunaan Properti dan Latar Tempat */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  2.3 Penggunaan Properti dan Latar Tempat (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: relevan, mendukung cerita
                </p>
                {getScoreInput(
                  scoringForm.propertiLatar,
                  (score) => setScoringForm(prev => ({ ...prev, propertiLatar: score })),
                  'Penggunaan Properti dan Latar Tempat'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.propertiLatar} × 0.25 = {(scoringForm.propertiLatar * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 2.4 Kesesuaian latar atau setting */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  2.4 Kesesuaian latar atau setting (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: realistis, konsisten, mendukung tema
                </p>
                {getScoreInput(
                  scoringForm.kesesuaianSetting,
                  (score) => setScoringForm(prev => ({ ...prev, kesesuaianSetting: score })),
                  'Kesesuaian latar atau setting'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kesesuaianSetting} × 0.25 = {(scoringForm.kesesuaianSetting * 0.25).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Visual dan Bentuk = {visualBentukTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* KRITERIA 3: VISUAL DAN EDITING */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 3: VISUAL DAN EDITING (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 3.1 Kerapian Transisi */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  3.1 Kerapian Transisi (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: cut, fade, dissolve, wipe — halus dan logis
                </p>
                {getScoreInput(
                  scoringForm.kerapianTransisi,
                  (score) => setScoringForm(prev => ({ ...prev, kerapianTransisi: score })),
                  'Kerapian Transisi'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kerapianTransisi} × 0.25 = {(scoringForm.kerapianTransisi * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 3.2 Ritme Pemotongan Adegan */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  3.2 Ritme Pemotongan Adegan (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: kecepatan editing sesuai emosi/tema
                </p>
                {getScoreInput(
                  scoringForm.ritmePemotongan,
                  (score) => setScoringForm(prev => ({ ...prev, ritmePemotongan: score })),
                  'Ritme Pemotongan Adegan'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.ritmePemotongan} × 0.25 = {(scoringForm.ritmePemotongan * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 3.3 Sinkronisasi audio-visual */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  3.3 Sinkronisasi audio-visual (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: suara, musik, subtitle, gerakan
                </p>
                {getScoreInput(
                  scoringForm.sinkronisasiAudio,
                  (score) => setScoringForm(prev => ({ ...prev, sinkronisasiAudio: score })),
                  'Sinkronisasi audio-visual'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.sinkronisasiAudio} × 0.25 = {(scoringForm.sinkronisasiAudio * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 3.4 Kreativitas efek pendukung */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  3.4 Kreativitas efek pendukung (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: efek suara, overlay, animasi, filter
                </p>
                {getScoreInput(
                  scoringForm.kreativitasEfek,
                  (score) => setScoringForm(prev => ({ ...prev, kreativitasEfek: score })),
                  'Kreativitas efek pendukung'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kreativitasEfek} × 0.25 = {(scoringForm.kreativitasEfek * 0.25).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Visual dan Editing = {visualEditingTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* KRITERIA 4: ISI/PESAN */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 4: ISI / PESAN (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 4.1 Kesesuaian dengan Tema */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  4.1 Kesesuaian dengan Tema (Bobot: 20%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: materi relevan, sesuai pesan utama
                </p>
                {getScoreInput(
                  scoringForm.kesesuaianTema,
                  (score) => setScoringForm(prev => ({ ...prev, kesesuaianTema: score })),
                  'Kesesuaian dengan Tema'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kesesuaianTema} × 0.2 = {(scoringForm.kesesuaianTema * 0.2).toFixed(1)}
                </div>
              </div>

              {/* 4.2 Kedalaman dan Relevansi Isi */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  4.2 Kedalaman dan Relevansi Isi (Bobot: 40%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: informasi bermakna, tidak sekadar hiburan
                </p>
                {getScoreInput(
                  scoringForm.kedalamanIsi,
                  (score) => setScoringForm(prev => ({ ...prev, kedalamanIsi: score }))
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kedalamanIsi} × 0.4 = {(scoringForm.kedalamanIsi * 0.4).toFixed(1)}
                </div>
              </div>

              {/* 4.3 Materi yang Divisualisasikan Dapat Menjadi Hook/Menarik */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  4.3 Materi yang Divisualisasikan Dapat Menjadi Hook/Menarik (Bobot: 40%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: daya tarik awal, emosional, atau kejutan
                </p>
                {getScoreInput(
                  scoringForm.dayaTarik,
                  (score) => setScoringForm(prev => ({ ...prev, dayaTarik: score })),
                  'Materi yang Divisualisasikan Dapat Menjadi Hook/Menarik'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.dayaTarik} × 0.4 = {(scoringForm.dayaTarik * 0.4).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Isi / Pesan = {isiPesanTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* REKAP NILAI AKHIR */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">REKAP NILAI AKHIR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">KRITERIA</th>
                      <th className="border border-gray-300 p-2 text-center">SKOR MAKSIMAL</th>
                      <th className="border border-gray-300 p-2 text-center">SKOR DIPEROLEH</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Sinematografi</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{sinematografiTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Visual dan Bentuk</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{visualBentukTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Visual dan Editing</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{visualEditingTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Isi / Pesan</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{isiPesanTotal}</td>
                    </tr>
                    <tr className="bg-yellow-100 font-bold">
                      <td className="border border-gray-300 p-2">TOTAL</td>
                      <td className="border border-gray-300 p-2 text-center">400</td>
                      <td className="border border-gray-300 p-2 text-center text-lg">{totalScore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              </CardContent>
            </Card> */}

            <Separator />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Penilaian Kualitatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Video memiliki sinematografi kuat dan editing apik, tapi pesan bisa lebih dalam. Tambahkan data atau narasi pendukung"
                  value={scoringForm.feedback}
                  onChange={(e) => setScoringForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="text-sm"
                />
              </CardContent>
            </Card>
            
            {/* Info tentang kualifikasi */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Sistem Kualifikasi Final</p>
                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                      Peserta dengan skor tertinggi akan lolos ke tahap final untuk presentasi karya.
                      Jumlah finalis akan ditentukan berdasarkan kuota yang tersedia.
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