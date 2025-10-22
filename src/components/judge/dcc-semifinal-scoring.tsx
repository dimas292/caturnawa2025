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
  FileText,
  Download,
  Eye,
  Check,
  X,
  Clock,
  User,
  School,
  Calendar,
  MessageSquare,
  Star,
  Image
} from 'lucide-react'

interface DCCSubmission {
  id: string
  participantName: string
  institution: string
  submissionTitle: string
  submittedAt: string
  fileUrl: string
  fileName: string
  fileSize: string
  status: 'pending' | 'reviewed' | 'qualified' | 'not_qualified'
  notes?: string
  deskripsiKarya?: string
  judgesCount?: number
  currentJudgeHasScored?: boolean
  canBeScored?: boolean
  allJudges?: Array<{
    judgeId: string
    judgeName: string
  }>
}

interface DCCSemifinalScore {
  submissionId: string
  // Desain Visual (3 sub-criteria)
  kerapianStruktur: number // 1-100 score
  komposisiGambar: number // 1-100 score
  kualitasEditing: number // 1-100 score
  // Isi/Pesan (3 sub-criteria)
  kesesuaianTema: number // 1-100 score
  kejelasanBahasa: number // 1-100 score
  dayaTarikMateri: number // 1-100 score
  // Originalitas (1 criteria)
  orisinalitas: number // 1-100 score
  feedback: string
}

interface DCCSemifinalScoringProps {
  submissions: DCCSubmission[]
  onScore: (score: DCCSemifinalScore) => void
  onDownload: (submissionId: string) => void
}

export default function DCCSemifinalScoring({
  submissions,
  onScore,
  onDownload
}: DCCSemifinalScoringProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<DCCSubmission | null>(null)
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const [scoringForm, setScoringForm] = useState<DCCSemifinalScore>({
    submissionId: '',
    // Desain Visual
    kerapianStruktur: 0,
    komposisiGambar: 0,
    kualitasEditing: 0,
    // Isi/Pesan
    kesesuaianTema: 0,
    kejelasanBahasa: 0,
    dayaTarikMateri: 0,
    // Originalitas
    orisinalitas: 0,
    feedback: ''
  })

  const handleScore = (submission: DCCSubmission) => {
    setSelectedSubmission(submission)
    setScoringForm({
      submissionId: submission.id,
      // Desain Visual
      kerapianStruktur: 0,
      komposisiGambar: 0,
      kualitasEditing: 0,
      // Isi/Pesan
      kesesuaianTema: 0,
      kejelasanBahasa: 0,
      dayaTarikMateri: 0,
      // Originalitas
      orisinalitas: 0,
      feedback: ''
    })
    setIsScoringOpen(true)
  }

  const handleSubmitScore = () => {
    if (!selectedSubmission) return

    // Validation for all sub-criteria
    const scores = [
      scoringForm.kerapianStruktur, scoringForm.komposisiGambar, scoringForm.kualitasEditing,
      scoringForm.kesesuaianTema, scoringForm.kejelasanBahasa, scoringForm.dayaTarikMateri,
      scoringForm.orisinalitas
    ]

    for (const score of scores) {
      if (score < 1 || score > 100) {
        alert('Harap berikan nilai 1-100 untuk semua sub-kriteria')
        return
      }
    }

    onScore(scoringForm)
    setIsScoringOpen(false)
    setSelectedSubmission(null)
  }

  const getStatusBadge = (status: string, judgesCount?: number) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu Review</Badge>
      case 'reviewed':
        const count = judgesCount || 0
        return (
          <Badge variant="outline" className="bg-blue-50">
            Sudah Direview ({count}/3 Juri)
          </Badge>
        )
      case 'qualified':
        return <Badge variant="default" className="bg-green-600">Lolos ke Final</Badge>
      case 'not_qualified':
        return <Badge variant="destructive">Tidak Lolos</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScoreInput = (score: number, onChange: (score: number) => void, label: string) => {
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true
    return submission.status === filterStatus
  })

  // Calculate weighted scores according to rubric
  const desainVisualTotal = Math.round(
    (scoringForm.kerapianStruktur * 0.5) +
    (scoringForm.komposisiGambar * 0.25) +
    (scoringForm.kualitasEditing * 0.25)
  )

  const isiPesanTotal = Math.round(
    (scoringForm.kesesuaianTema * 0.3) +
    (scoringForm.kejelasanBahasa * 0.4) +
    (scoringForm.dayaTarikMateri * 0.3)
  )

  const originalitasTotal = scoringForm.orisinalitas

  const totalScore = desainVisualTotal + isiPesanTotal + originalitasTotal
  const percentageScore = Math.round((totalScore / 300) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">DCC Infografis</h2>
          <p className="text-gray-600 mt-1">
            Penilaian karya infografis peserta untuk tahap semifinal
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
          <CardTitle>Daftar Karya Infografis</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Tidak ada karya ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-purple-500">
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
                        </div>

                        {submission.deskripsiKarya && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Deskripsi:</strong> {submission.deskripsiKarya}
                          </div>
                        )}
                        

                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(submission.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        
                        {submission.canBeScored ? (
                          <Button
                            size="sm"
                            onClick={() => handleScore(submission)}
                            variant={submission.currentJudgeHasScored ? "outline" : "default"}
                            className={submission.currentJudgeHasScored ? "" : "bg-purple-600 hover:bg-purple-700"}
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
              Berikan penilaian untuk tiga kriteria utama evaluasi semifinal DCC Infografis
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6 py-2">
              {selectedSubmission && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Peserta:</p>
                        <p className="font-semibold text-base">{selectedSubmission.participantName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <School className="h-3.5 w-3.5" />
                          {selectedSubmission.institution}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            
            {/* KRITERIA 1: DESAIN VISUAL (100 poin) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 1: DESAIN VISUAL (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 1.1 Kerapian Struktur */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.1 Kerapian Struktur (Bobot: 50%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Tata letak, alur visual, keselarasan elemen
                </p>
                {getScoreInput(
                  scoringForm.kerapianStruktur,
                  (score) => setScoringForm(prev => ({ ...prev, kerapianStruktur: score })),
                  'Kerapian Struktur'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kerapianStruktur} × 0.5 = {(scoringForm.kerapianStruktur * 0.5).toFixed(1)}
                </div>
              </div>

              {/* 1.2 Komposisi Gambar */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.2 Komposisi Gambar (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Pemilihan warna, kontras, fokus visual
                </p>
                {getScoreInput(
                  scoringForm.komposisiGambar,
                  (score) => setScoringForm(prev => ({ ...prev, komposisiGambar: score })),
                  'Komposisi Gambar'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.komposisiGambar} × 0.25 = {(scoringForm.komposisiGambar * 0.25).toFixed(1)}
                </div>
              </div>

              {/* 1.3 Kualitas Editing */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-800">
                  1.3 Kualitas Editing (Bobot: 25%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Kejernihan gambar, efek visual, penggunaan font
                </p>
                {getScoreInput(
                  scoringForm.kualitasEditing,
                  (score) => setScoringForm(prev => ({ ...prev, kualitasEditing: score })),
                  'Kualitas Editing'
                )}
                <div className="text-xs text-blue-600">
                  Akumulasi: {scoringForm.kualitasEditing} × 0.25 = {(scoringForm.kualitasEditing * 0.25).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Desain Visual = {desainVisualTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* KRITERIA 2: ISI / PESAN (100 poin) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 2: ISI / PESAN (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 2.1 Kesesuaian Tema dan Relevansi Data */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-800">
                  2.1 Kesesuaian Tema dan Relevansi Data (Bobot: 30%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Sesuai dengan tema yang ditetapkan serta relevan dengan data yang diambil
                </p>
                {getScoreInput(
                  scoringForm.kesesuaianTema,
                  (score) => setScoringForm(prev => ({ ...prev, kesesuaianTema: score })),
                  'Kesesuaian Tema'
                )}
                <div className="text-xs text-green-600">
                  Akumulasi: {scoringForm.kesesuaianTema} × 0.3 = {(scoringForm.kesesuaianTema * 0.3).toFixed(1)}
                </div>
              </div>

              {/* 2.2 Kejelasan Bahasa */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-800">
                  2.2 Kejelasan Bahasa (Bobot: 40%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Bahasa yang digunakan singkat, jelas, dan mudah dipahami
                </p>
                {getScoreInput(
                  scoringForm.kejelasanBahasa,
                  (score) => setScoringForm(prev => ({ ...prev, kejelasanBahasa: score })),
                  'Kejelasan Bahasa'
                )}
                <div className="text-xs text-green-600">
                  Akumulasi: {scoringForm.kejelasanBahasa} × 0.4 = {(scoringForm.kejelasanBahasa * 0.4).toFixed(1)}
                </div>
              </div>

              {/* 2.3 Daya Tarik Materi */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-800">
                  2.3 Daya Tarik Materi (Bobot: 30%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Materi yang divisualisasikan dapat menjadi hook / menarik perhatian
                </p>
                {getScoreInput(
                  scoringForm.dayaTarikMateri,
                  (score) => setScoringForm(prev => ({ ...prev, dayaTarikMateri: score })),
                  'Daya Tarik Materi'
                )}
                <div className="text-xs text-green-600">
                  Akumulasi: {scoringForm.dayaTarikMateri} × 0.3 = {(scoringForm.dayaTarikMateri * 0.3).toFixed(1)}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Isi / Pesan = {isiPesanTotal} / 100
              </div>
              </CardContent>
            </Card>

            <Separator />

            {/* KRITERIA 3: ORIGINALITAS KARYA (100 poin) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">KRITERIA 3: ORIGINALITAS KARYA (100 poin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

              {/* 3.1 Orisinalitas */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-800">
                  3.1 Orisinalitas (Bobot: 100%)
                </label>
                <p className="text-xs text-gray-600">
                  Penilaian: Karya merupakan hasil ciptaan sendiri, bukan plagiat atau jiplakan karya orang lain / kecerdasan buatan
                </p>
                {getScoreInput(
                  scoringForm.orisinalitas,
                  (score) => setScoringForm(prev => ({ ...prev, orisinalitas: score })),
                  'Orisinalitas'
                )}
                <div className="text-xs text-purple-600">
                  Akumulasi: {scoringForm.orisinalitas} × 1.0 = {scoringForm.orisinalitas}
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded font-bold">
                Total Originalitas = {originalitasTotal} / 100
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
                      <th className="border border-gray-300 p-2 text-left">Kriteria</th>
                      <th className="border border-gray-300 p-2 text-center">Skor Maksimal</th>
                      <th className="border border-gray-300 p-2 text-center">Skor Diperoleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Desain Visual</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{desainVisualTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Isi / Pesan</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{isiPesanTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Originalitas Karya</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{originalitasTotal}</td>
                    </tr>
                    <tr className="bg-yellow-100 font-bold">
                      <td className="border border-gray-300 p-2">TOTAL</td>
                      <td className="border border-gray-300 p-2 text-center">300</td>
                      <td className="border border-gray-300 p-2 text-center text-lg">{totalScore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              </CardContent>
            </Card> */}

            <Separator />

            {/* FEEDBACK UMUM UNTUK PESERTA */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Penilaian Kualitatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              <Textarea
              placeholder='Desain menarik dan orisinal, tapi pesan terlalu padat. Gunakan bullet point dan visual agar lebih jelas'
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
