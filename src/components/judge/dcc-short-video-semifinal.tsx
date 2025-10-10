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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Penilaian</Badge>
      case 'reviewed':
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Sudah Dinilai</Badge>
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
          <h2 className="text-2xl font-bold">DCC Short Video - Penilaian Semifinal</h2>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Video</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Penilaian</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lolos ke Final</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'qualified').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tidak Lolos</p>
                <p className="text-2xl font-bold text-red-600">
                  {submissions.filter(s => s.status === 'not_qualified').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
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
                          {getStatusBadge(submission.status)}
                        </div>

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

                        {submission.youtubeUrl && (
                          <div className="mb-2">
                            <a
                              href={submission.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Play className="h-4 w-4" />
                              Lihat di YouTube
                            </a>
                          </div>
                        )}

                        {submission.deskripsiVideo && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Deskripsi:</strong> {submission.deskripsiVideo}
                          </div>
                        )}

                        {submission.notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <div className="flex items-start gap-1">
                              <Eye className="h-4 w-4 mt-0.5" />
                              {submission.notes}
                            </div>
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

                        {submission.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleScore(submission)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Nilai
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
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle>📊 Rubrik Penilaian DCC Short Video - Semifinal</DialogTitle>
            <DialogDescription>
              Sistem penilaian video pendek dengan 4 kriteria utama dan sub-kriteria berbobot. Total skor maksimal: 400 poin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedSubmission && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">Peserta:</p>
                <p className="font-medium">{selectedSubmission.participantName}</p>
                <p className="text-sm text-gray-600">{selectedSubmission.institution}</p>
                {selectedSubmission.youtubeUrl && (
                  <a
                    href={selectedSubmission.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    <Play className="h-4 w-4" />
                    Tonton di YouTube
                  </a>
                )}
              </div>
            )}

            {/* KRITERIA 1: SINEMATOGRAFI */}
            <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-bold text-lg text-blue-900">🎥 KRITERIA 1: SINEMATOGRAFI (100 poin)</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-blue-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-300 p-2 text-left">SUB-KRITERIA</th>
                      <th className="border border-blue-300 p-2 text-center">BOBOT</th>
                      <th className="border border-blue-300 p-2 text-center">SKOR (0–100)</th>
                      <th className="border border-blue-300 p-2 text-center">AKUMULASI NILAI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-300 p-2">
                        <div className="text-sm font-medium">Angle Shot</div>
                        <div className="text-xs text-gray-600">(pemilihan sudut kamera, variasi shot: wide, close-up, over-the-shoulder, dll.)</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">40%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.angleShot,
                          (score) => setScoringForm(prev => ({ ...prev, angleShot: score }))
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.angleShot * 0.4).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-300 p-2">
                        <div className="text-sm font-medium">Komposisi Gambar</div>
                        <div className="text-xs text-gray-600">(aturan rule of thirds, fokus visual, framing)</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">30%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.komposisiGambar,
                          (score) => setScoringForm(prev => ({ ...prev, komposisiGambar: score }))
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.komposisiGambar * 0.3).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-300 p-2">
                        <div className="text-sm font-medium">Kualitas Gambar</div>
                        <div className="text-xs text-gray-600">(kejernihan, cahaya, resolusi, noise)</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">30%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.kualitasGambar,
                          (score) => setScoringForm(prev => ({ ...prev, kualitasGambar: score }))
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.kualitasGambar * 0.3).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-100 p-3 rounded font-bold text-blue-900">
                ✅ Total Sinematografi = {sinematografiTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 2: VISUAL DAN BENTUK */}
            <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
              <h3 className="font-bold text-lg text-green-900">🎨 KRITERIA 2: VISUAL DAN BENTUK (100 poin)</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-green-300">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border border-green-300 p-2 text-left">SUB-KRITERIA</th>
                      <th className="border border-green-300 p-2 text-center">BOBOT</th>
                      <th className="border border-green-300 p-2 text-center">SKOR (0–100)</th>
                      <th className="border border-green-300 p-2 text-center">AKUMULASI NILAI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Pemilihan warna</div>
                        <div className="text-xs text-gray-600">(palet warna, kontras, mood visual)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.pilihanWarna,
                          (score) => setScoringForm(prev => ({ ...prev, pilihanWarna: score }))
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.pilihanWarna * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Tata Kostum</div>
                        <div className="text-xs text-gray-600">(sesuai karakter, tema, konteks)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.tataKostum,
                          (score) => setScoringForm(prev => ({ ...prev, tataKostum: score }))
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.tataKostum * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Penggunaan Properti dan Latar Tempat</div>
                        <div className="text-xs text-gray-600">(relevan, mendukung cerita)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.propertiLatar,
                          (score) => setScoringForm(prev => ({ ...prev, propertiLatar: score }))
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.propertiLatar * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Kesesuaian latar atau setting</div>
                        <div className="text-xs text-gray-600">(realistis, konsisten, mendukung tema)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.kesesuaianSetting,
                          (score) => setScoringForm(prev => ({ ...prev, kesesuaianSetting: score }))
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.kesesuaianSetting * 0.25).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-green-100 p-3 rounded font-bold text-green-900">
                ✅ Total Visual dan Bentuk = {visualBentukTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 3: VISUAL DAN EDITING */}
            <div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h3 className="font-bold text-lg text-orange-900">✂️ KRITERIA 3: VISUAL DAN EDITING (100 poin)</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-orange-300">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="border border-orange-300 p-2 text-left">SUB-KRITERIA</th>
                      <th className="border border-orange-300 p-2 text-center">BOBOT</th>
                      <th className="border border-orange-300 p-2 text-center">SKOR (0–100)</th>
                      <th className="border border-orange-300 p-2 text-center">AKUMULASI NILAI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-orange-300 p-2">
                        <div className="text-sm font-medium">Kerapian Transisi</div>
                        <div className="text-xs text-gray-600">(cut, fade, dissolve, wipe — halus dan logis)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">25%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.kerapianTransisi,
                          (score) => setScoringForm(prev => ({ ...prev, kerapianTransisi: score }))
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.kerapianTransisi * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-orange-300 p-2">
                        <div className="text-sm font-medium">Ritme Pemotongan Adegan</div>
                        <div className="text-xs text-gray-600">(kecepatan editing sesuai emosi/tema)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">25%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.ritmePemotongan,
                          (score) => setScoringForm(prev => ({ ...prev, ritmePemotongan: score }))
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.ritmePemotongan * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-orange-300 p-2">
                        <div className="text-sm font-medium">Sinkronisasi audio-visual</div>
                        <div className="text-xs text-gray-600">(suara, musik, subtitle, gerakan)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">25%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.sinkronisasiAudio,
                          (score) => setScoringForm(prev => ({ ...prev, sinkronisasiAudio: score }))
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.sinkronisasiAudio * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-orange-300 p-2">
                        <div className="text-sm font-medium">Kreativitas efek pendukung</div>
                        <div className="text-xs text-gray-600">(efek suara, overlay, animasi, filter)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">25%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.kreativitasEfek,
                          (score) => setScoringForm(prev => ({ ...prev, kreativitasEfek: score }))
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.kreativitasEfek * 0.25).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-orange-100 p-3 rounded font-bold text-orange-900">
                ✅ Total Visual dan Editing = {visualEditingTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 4: ISI/PESAN */}
            <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h3 className="font-bold text-lg text-purple-900">💬 KRITERIA 4: ISI / PESAN (100 poin)</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-purple-300">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-purple-300 p-2 text-left">SUB-KRITERIA</th>
                      <th className="border border-purple-300 p-2 text-center">BOBOT</th>
                      <th className="border border-purple-300 p-2 text-center">SKOR (0–100)</th>
                      <th className="border border-purple-300 p-2 text-center">AKUMULASI NILAI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-purple-300 p-2">
                        <div className="text-sm font-medium">Kesesuaian dengan Tema</div>
                        <div className="text-xs text-gray-600">(materi relevan, sesuai pesan utama)</div>
                      </td>
                      <td className="border border-purple-300 p-2 text-center">20%</td>
                      <td className="border border-purple-300 p-2">
                        {getScoreInput(
                          scoringForm.kesesuaianTema,
                          (score) => setScoringForm(prev => ({ ...prev, kesesuaianTema: score }))
                        )}
                      </td>
                      <td className="border border-purple-300 p-2 text-center font-bold">
                        {(scoringForm.kesesuaianTema * 0.2).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-purple-300 p-2">
                        <div className="text-sm font-medium">Kedalaman dan Relevansi Isi</div>
                        <div className="text-xs text-gray-600">(informasi bermakna, tidak sekadar hiburan)</div>
                      </td>
                      <td className="border border-purple-300 p-2 text-center">40%</td>
                      <td className="border border-purple-300 p-2">
                        {getScoreInput(
                          scoringForm.kedalamanIsi,
                          (score) => setScoringForm(prev => ({ ...prev, kedalamanIsi: score }))
                        )}
                      </td>
                      <td className="border border-purple-300 p-2 text-center font-bold">
                        {(scoringForm.kedalamanIsi * 0.4).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-purple-300 p-2">
                        <div className="text-sm font-medium">Materi yang Divisualisasikan Dapat Menjadi Hook/Menarik</div>
                        <div className="text-xs text-gray-600">(daya tarik awal, emosional, atau kejutan)</div>
                      </td>
                      <td className="border border-purple-300 p-2 text-center">40%</td>
                      <td className="border border-purple-300 p-2">
                        {getScoreInput(
                          scoringForm.dayaTarik,
                          (score) => setScoringForm(prev => ({ ...prev, dayaTarik: score }))
                        )}
                      </td>
                      <td className="border border-purple-300 p-2 text-center font-bold">
                        {(scoringForm.dayaTarik * 0.4).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-purple-100 p-3 rounded font-bold text-purple-900">
                ✅ Total Isi / Pesan = {isiPesanTotal} / 100
              </div>
            </div>

            <Separator />

            {/* REKAP NILAI AKHIR */}
            <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">📊 REKAP NILAI AKHIR</h3>

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

              <div className="bg-yellow-50 p-3 rounded">
                <div className="font-semibold">Konversi ke Persentase:</div>
                <div>({totalScore} ÷ 400) × 100 = {percentageScore}%</div>
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold">Predikat:</div>
                <div className="font-bold text-lg">
                  {percentageScore >= 90 ? '🌟 Sangat Baik' :
                   percentageScore >= 75 ? '👍 Baik' :
                   percentageScore >= 60 ? '✓ Cukup' : '📝 Perlu Perbaikan'}
                </div>
              </div>
            </div>

            <Separator />

            {/* 💬 FEEDBACK UMUM UNTUK PEMBUAT VIDEO */}
            <div className="space-y-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <h3 className="font-bold text-lg text-yellow-900">💬 FEEDBACK UMUM UNTUK PEMBUAT VIDEO</h3>
              <label className="text-sm font-medium text-yellow-800">
                Tulis 2–3 kalimat umpan balik menyeluruh yang membangun
              </label>
              <Textarea
                placeholder="Contoh: 'Video ini memiliki sinematografi yang kuat dan editing yang sangat apik, namun isi pesannya bisa lebih dalam lagi. Saran: tambahkan data atau narasi pendukung untuk meningkatkan kedalaman pesan.'"
                value={scoringForm.feedback}
                onChange={(e) => setScoringForm(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                className="text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsScoringOpen(false)}
                  className="px-6 py-2"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitScore}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Penilaian
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}