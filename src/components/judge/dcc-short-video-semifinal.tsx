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
  sinematografi: number // 1-100 (KRITERIA 1)
  visualBentuk: number // 1-100 (KRITERIA 2)
  visualEditing: number // 1-100 (KRITERIA 3)
  isiPesan: number // 1-100 (KRITERIA 4)
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
    sinematografi: 0,
    visualBentuk: 0,
    visualEditing: 0,
    isiPesan: 0,
    feedback: ''
  })

  const handleScore = (submission: DCCVideoSubmission) => {
    setSelectedSubmission(submission)
    setScoringForm({
      submissionId: submission.id,
      sinematografi: 0,
      visualBentuk: 0,
      visualEditing: 0,
      isiPesan: 0,
      feedback: ''
    })
    setIsScoringOpen(true)
  }

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return

    // Validation for all criteria
    const scores = [
      scoringForm.sinematografi,
      scoringForm.visualBentuk,
      scoringForm.visualEditing,
      scoringForm.isiPesan
    ]

    for (const score of scores) {
      if (score < 1 || score > 100) {
        alert('Harap berikan nilai 1-100 untuk semua kriteria')
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

  // Calculate total score from 4 main criteria
  const totalScore = scoringForm.sinematografi + scoringForm.visualBentuk + scoringForm.visualEditing + scoringForm.isiPesan
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
                <p className="text-sm text-gray-600">
                  Penilaian mencakup: angle shot, komposisi gambar, kualitas gambar, pencahayaan, dan teknik sinematografi lainnya.
                </p>
                {getScoreInput(
                  scoringForm.sinematografi,
                  (score) => setScoringForm(prev => ({ ...prev, sinematografi: score }))
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-900">Nilai: {scoringForm.sinematografi}/100</div>
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
                <p className="text-sm text-gray-600">
                  Penilaian mencakup: pemilihan warna, tata kostum, properti & latar tempat, kesesuaian setting, dan elemen visual lainnya.
                </p>
                {getScoreInput(
                  scoringForm.visualBentuk,
                  (score) => setScoringForm(prev => ({ ...prev, visualBentuk: score }))
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-900">Nilai: {scoringForm.visualBentuk}/100</div>
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
                <p className="text-sm text-gray-600">
                  Penilaian mencakup: kerapian transisi, ritme pemotongan, sinkronisasi audio-visual, kreativitas efek, dan kualitas editing.
                </p>
                {getScoreInput(
                  scoringForm.visualEditing,
                  (score) => setScoringForm(prev => ({ ...prev, visualEditing: score }))
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-900">Nilai: {scoringForm.visualEditing}/100</div>
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
                <p className="text-sm text-gray-600">
                  Penilaian mencakup: kesesuaian tema, kedalaman isi, relevansi pesan, daya tarik, dan nilai yang disampaikan.
                </p>
                {getScoreInput(
                  scoringForm.isiPesan,
                  (score) => setScoringForm(prev => ({ ...prev, isiPesan: score }))
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-900">Nilai: {scoringForm.isiPesan}/100</div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* REKAP NILAI AKHIR */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">REKAP NILAI AKHIR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Sinematografi:</span>
                    <span className="font-bold">{scoringForm.sinematografi}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Visual dan Bentuk:</span>
                    <span className="font-bold">{scoringForm.visualBentuk}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Visual dan Editing:</span>
                    <span className="font-bold">{scoringForm.visualEditing}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Isi / Pesan:</span>
                    <span className="font-bold">{scoringForm.isiPesan}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-2 border-blue-300">
                    <span className="font-bold text-lg">TOTAL:</span>
                    <span className="font-bold text-2xl text-blue-700">{totalScore}/400</span>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Persentase: {percentageScore}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

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