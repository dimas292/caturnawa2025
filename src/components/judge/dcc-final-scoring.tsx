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
  Check,
  Clock,
  User,
  School,
  Calendar,
  Star,
  Presentation,
} from 'lucide-react'

interface DCCFinalist {
  id: string
  participantName: string
  institution: string
  submissionTitle: string
  submittedAt: string
  fileUrl: string
  fileName: string
  fileSize: string
  presentationOrder: number
  scheduledTime?: string
  teamName?: string
  deskripsiKarya?: string
  deskripsiVideo?: string
  youtubeUrl?: string
  duration?: string
  semifinalScore?: number
  hasBeenScored?: boolean
  finalScore?: number
}

interface DCCFinalScore {
  submissionId: string
  // Struktur Presentasi
  alurPresentasi: number // 1-100 score (30%)
  konsistensiTema: number // 1-100 score (20%)
  singkatJelas: number // 1-100 score (50%)
  // Teknik Penyampaian
  kepercayaanDiri: number // 1-100 score (35%)
  gayaPenyampaian: number // 1-100 score (25%)
  bahasaSopan: number // 1-100 score (25%)
  sikapPresentasi: number // 1-100 score (15%)
  // Penguasaan Materi
  pengetahuanTema: number // 1-100 score (60%)
  keluasanWawasan: number // 1-100 score (40%)
  // Kolaborasi Tim
  komunikasiTim: number // 1-100 score (50%)
  kerjasamaTim: number // 1-100 score (50%)
  feedback: string
}

interface DCCFinalScoringProps {
  finalists: DCCFinalist[]
  onScore: (score: DCCFinalScore) => Promise<void>
  onDownload: (submissionId: string) => void
  category?: 'DCC_INFOGRAFIS' | 'DCC_SHORT_VIDEO'
}

export default function DCCFinalScoring({
  finalists,
  onScore,
  onDownload,
  category = 'DCC_INFOGRAFIS'
}: DCCFinalScoringProps) {
  const [selectedFinalist, setSelectedFinalist] = useState<DCCFinalist | null>(null)
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const [filterOrder, setFilterOrder] = useState<string>('all')

  // Debug: Log finalists data
  React.useEffect(() => {
    console.log('📋 DCCFinalScoring component received finalists:', finalists)
    console.log('📊 Total finalists in component:', finalists?.length || 0)
    console.log('🏷️ Category:', category)
  }, [finalists, category])

  const [scoringForm, setScoringForm] = useState<DCCFinalScore>({
    submissionId: '',
    // Struktur Presentasi
    alurPresentasi: 0,
    konsistensiTema: 0,
    singkatJelas: 0,
    // Teknik Penyampaian
    kepercayaanDiri: 0,
    gayaPenyampaian: 0,
    bahasaSopan: 0,
    sikapPresentasi: 0,
    // Penguasaan Materi
    pengetahuanTema: 0,
    keluasanWawasan: 0,
    // Kolaborasi Tim
    komunikasiTim: 0,
    kerjasamaTim: 0,
    feedback: ''
  })

  const handleScore = (finalist: DCCFinalist) => {
    setSelectedFinalist(finalist)
    setScoringForm({
      submissionId: finalist.id,
      // Struktur Presentasi
      alurPresentasi: 0,
      konsistensiTema: 0,
      singkatJelas: 0,
      // Teknik Penyampaian
      kepercayaanDiri: 0,
      gayaPenyampaian: 0,
      bahasaSopan: 0,
      sikapPresentasi: 0,
      // Penguasaan Materi
      pengetahuanTema: 0,
      keluasanWawasan: 0,
      // Kolaborasi Tim
      komunikasiTim: 0,
      kerjasamaTim: 0,
      feedback: ''
    })
    setIsScoringOpen(true)
  }

  const handleSubmitScore = async () => {
    if (!selectedFinalist) return

    // Validation for all sub-criteria
    const scores = [
      scoringForm.alurPresentasi, scoringForm.konsistensiTema, scoringForm.singkatJelas,
      scoringForm.kepercayaanDiri, scoringForm.gayaPenyampaian, scoringForm.bahasaSopan, scoringForm.sikapPresentasi,
      scoringForm.pengetahuanTema, scoringForm.keluasanWawasan,
      scoringForm.komunikasiTim, scoringForm.kerjasamaTim
    ]

    for (const score of scores) {
      if (score < 1 || score > 100) {
        alert('Harap berikan nilai 1-100 untuk semua sub-kriteria')
        return
      }
    }

    if (!scoringForm.feedback.trim()) {
      alert('Harap berikan feedback untuk tim')
      return
    }

    try {
      await onScore(scoringForm)
      setIsScoringOpen(false)
      setSelectedFinalist(null)
    } catch (error) {
      console.error('Error submitting final score:', error)
      alert('Terjadi kesalahan saat menyimpan penilaian. Silakan coba lagi.')
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

  const filteredFinalists = finalists.filter(finalist => {
    if (filterOrder === 'all') return true
    return finalist.presentationOrder.toString() === filterOrder
  }).sort((a, b) => a.presentationOrder - b.presentationOrder)

  // Calculate weighted scores according to rubric
  const strukturPresentasiTotal = Math.round(
    (scoringForm.alurPresentasi * 0.3) +
    (scoringForm.konsistensiTema * 0.2) +
    (scoringForm.singkatJelas * 0.5)
  )

  const teknikPenyampaianTotal = Math.round(
    (scoringForm.kepercayaanDiri * 0.35) +
    (scoringForm.gayaPenyampaian * 0.25) +
    (scoringForm.bahasaSopan * 0.25) +
    (scoringForm.sikapPresentasi * 0.15)
  )

  const penguasaanMateriTotal = Math.round(
    (scoringForm.pengetahuanTema * 0.6) +
    (scoringForm.keluasanWawasan * 0.4)
  )

  const kolaborasiTimTotal = Math.round(
    (scoringForm.komunikasiTim * 0.5) +
    (scoringForm.kerjasamaTim * 0.5)
  )

  const totalScore = strukturPresentasiTotal + teknikPenyampaianTotal + penguasaanMateriTotal + kolaborasiTimTotal
  const percentageScore = Math.round((totalScore / 400) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            DCC {category === 'DCC_SHORT_VIDEO' ? 'Short Video' : 'Infografis'} - Penilaian Final
          </h2>
          <p className="text-gray-600 mt-1">
            Penilaian presentasi karya {category === 'DCC_SHORT_VIDEO' ? 'short video' : 'infografis'} team untuk tahap final dengan rubrik terstruktur
          </p>
        </div>
      </div>

      {/* Finalists List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Finalis</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFinalists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Presentation className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Tidak ada finalis ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFinalists.map((finalist) => (
                <Card key={finalist.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{finalist.submissionTitle}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              {finalist.teamName && (
                                <>
                                  <span className="text-xs text-gray-500">Team:</span>
                                  <span className="ml-1 font-medium">{finalist.teamName}</span>
                                  <br />
                                </>
                              )}
                              <span className="text-xs text-gray-500">{finalist.teamName ? 'Peserta:' : 'Team:'}</span>
                              <span className="ml-1">{finalist.participantName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4" />
                            <span>{finalist.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{finalist.scheduledTime || 'Belum dijadwalkan'}</span>
                          </div>
                        </div>

                        <div className="mb-2 flex gap-2 flex-wrap">
                          {finalist.semifinalScore && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Skor Semifinal: {finalist.semifinalScore}/300
                            </Badge>
                          )}
                          {finalist.hasBeenScored && finalist.finalScore && (
                            <Badge className="bg-green-100 text-green-800">
                              Skor Final: {finalist.finalScore}/400
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>{finalist.fileName}</span>
                          <span>{finalist.fileSize}</span>
                        </div>

                        {(finalist.deskripsiKarya || finalist.deskripsiVideo) && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Deskripsi:</strong> {finalist.deskripsiKarya || finalist.deskripsiVideo}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {finalist.hasBeenScored ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScore(finalist)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Edit Penilaian
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleScore(finalist)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Nilai Presentasi
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
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle>
              📊 Rubrik Penilaian DCC {category === 'DCC_SHORT_VIDEO' ? 'Short Video' : 'Infografis'} - Final
            </DialogTitle>
            <DialogDescription>
              Sistem penilaian format presentasi {category === 'DCC_SHORT_VIDEO' ? 'karya video pendek' : 'tim'} dengan 4 kriteria utama dan sub-kriteria berbobot. Total skor maksimal: 400 poin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedFinalist && (
              <div className="bg-gray-50 p-3 rounded">
                {selectedFinalist.teamName && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Team:</p>
                    <p className="font-medium">{selectedFinalist.teamName}</p>
                    <p className="text-sm text-gray-600 mb-2">Peserta: {selectedFinalist.participantName}</p>
                  </>
                )}
                {!selectedFinalist.teamName && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Team:</p>
                    <p className="font-medium">{selectedFinalist.participantName}</p>
                  </>
                )}
                <p className="text-sm text-gray-600">{selectedFinalist.institution}</p>
              </div>
            )}

            {/* KRITERIA 1: STRUKTUR PRESENTASI */}
            <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-bold text-lg text-blue-900">📊 KRITERIA 1: STRUKTUR PRESENTASI (100 poin)</h3>

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
                        <div className="text-sm font-medium">Presentasi memiliki alur yang terorganisir</div>
                        <div className="text-xs text-gray-600">(introduksi, isi, kesimpulan)</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">30%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.alurPresentasi,
                          (score) => setScoringForm(prev => ({ ...prev, alurPresentasi: score })),
                          'Alur Presentasi'
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.alurPresentasi * 0.3).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-300 p-2">
                        <div className="text-sm font-medium">Tidak menyimpang dari tema yang ditetapkan</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">20%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.konsistensiTema,
                          (score) => setScoringForm(prev => ({ ...prev, konsistensiTema: score })),
                          'Konsistensi Tema'
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.konsistensiTema * 0.2).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-300 p-2">
                        <div className="text-sm font-medium">Materi yang dituang dalam presentasi singkat, jelas, dan tidak bertele-tele</div>
                      </td>
                      <td className="border border-blue-300 p-2 text-center">50%</td>
                      <td className="border border-blue-300 p-2">
                        {getScoreInput(
                          scoringForm.singkatJelas,
                          (score) => setScoringForm(prev => ({ ...prev, singkatJelas: score })),
                          'Singkat dan Jelas'
                        )}
                      </td>
                      <td className="border border-blue-300 p-2 text-center font-bold">
                        {(scoringForm.singkatJelas * 0.5).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-100 p-3 rounded font-bold text-blue-900">
                ✅ Total Struktur Presentasi = {strukturPresentasiTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 2: TEKNIK PENYAMPAIAN */}
            <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
              <h3 className="font-bold text-lg text-green-900">🎤 KRITERIA 2: TEKNIK PENYAMPAIAN (100 poin)</h3>

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
                        <div className="text-sm font-medium">Kepercayaan diri seperti intonasi suara dan kontak mata dengan audiens</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">35%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.kepercayaanDiri,
                          (score) => setScoringForm(prev => ({ ...prev, kepercayaanDiri: score })),
                          'Kepercayaan Diri'
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.kepercayaanDiri * 0.35).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Gaya penyampaian yang menarik (ekspresi wajah, gerakan tubuh, dinamika)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.gayaPenyampaian,
                          (score) => setScoringForm(prev => ({ ...prev, gayaPenyampaian: score })),
                          'Gaya Penyampaian'
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.gayaPenyampaian * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Penggunaan bahasa yang sopan dan sesuai konteks</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">25%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.bahasaSopan,
                          (score) => setScoringForm(prev => ({ ...prev, bahasaSopan: score })),
                          'Bahasa Sopan'
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.bahasaSopan * 0.25).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-300 p-2">
                        <div className="text-sm font-medium">Menjaga sikap selama presentasi (tidak menggoyangkan kaki, tidak terlihat gugup)</div>
                      </td>
                      <td className="border border-green-300 p-2 text-center">15%</td>
                      <td className="border border-green-300 p-2">
                        {getScoreInput(
                          scoringForm.sikapPresentasi,
                          (score) => setScoringForm(prev => ({ ...prev, sikapPresentasi: score })),
                          'Sikap Presentasi'
                        )}
                      </td>
                      <td className="border border-green-300 p-2 text-center font-bold">
                        {(scoringForm.sikapPresentasi * 0.15).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-green-100 p-3 rounded font-bold text-green-900">
                ✅ Total Teknik Penyampaian = {teknikPenyampaianTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 3: PENGUASAAN MATERI */}
            <div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h3 className="font-bold text-lg text-orange-900">🧠 KRITERIA 3: PENGUASAAN MATERI (100 poin)</h3>

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
                        <div className="text-sm font-medium">Tingkat pengetahuan dan pemahaman dalam tema</div>
                        <div className="text-xs text-gray-600">(akurasi informasi, kedalaman analisis)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">60%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.pengetahuanTema,
                          (score) => setScoringForm(prev => ({ ...prev, pengetahuanTema: score })),
                          'Pengetahuan Tema'
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.pengetahuanTema * 0.6).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-orange-300 p-2">
                        <div className="text-sm font-medium">Tingkat keluasan wawasan, khususnya terkait tema yang dikaji</div>
                        <div className="text-xs text-gray-600">(pengetahuan tambahan, konteks global/lokal)</div>
                      </td>
                      <td className="border border-orange-300 p-2 text-center">40%</td>
                      <td className="border border-orange-300 p-2">
                        {getScoreInput(
                          scoringForm.keluasanWawasan,
                          (score) => setScoringForm(prev => ({ ...prev, keluasanWawasan: score })),
                          'Keluasan Wawasan'
                        )}
                      </td>
                      <td className="border border-orange-300 p-2 text-center font-bold">
                        {(scoringForm.keluasanWawasan * 0.4).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-orange-100 p-3 rounded font-bold text-orange-900">
                ✅ Total Penguasaan Materi = {penguasaanMateriTotal} / 100
              </div>
            </div>

            <Separator />

            {/* KRITERIA 4: KOLABORASI TIM */}
            <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h3 className="font-bold text-lg text-purple-900">👥 KRITERIA 4: KOLABORASI TIM (100 poin)</h3>

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
                        <div className="text-sm font-medium">Kemampuan berkomunikasi dan berargumen secara efektif dalam tim</div>
                        <div className="text-xs text-gray-600">(koordinasi, pembagian tugas, saling mendukung)</div>
                      </td>
                      <td className="border border-purple-300 p-2 text-center">50%</td>
                      <td className="border border-purple-300 p-2">
                        {getScoreInput(
                          scoringForm.komunikasiTim,
                          (score) => setScoringForm(prev => ({ ...prev, komunikasiTim: score })),
                          'Komunikasi Tim'
                        )}
                      </td>
                      <td className="border border-purple-300 p-2 text-center font-bold">
                        {(scoringForm.komunikasiTim * 0.5).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-purple-300 p-2">
                        <div className="text-sm font-medium">Kemampuan bekerjasama dalam tim</div>
                        <div className="text-xs text-gray-600">(saling melengkapi, tidak ada dominasi satu orang)</div>
                      </td>
                      <td className="border border-purple-300 p-2 text-center">50%</td>
                      <td className="border border-purple-300 p-2">
                        {getScoreInput(
                          scoringForm.kerjasamaTim,
                          (score) => setScoringForm(prev => ({ ...prev, kerjasamaTim: score })),
                          'Kerjasama Tim'
                        )}
                      </td>
                      <td className="border border-purple-300 p-2 text-center font-bold">
                        {(scoringForm.kerjasamaTim * 0.5).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-purple-100 p-3 rounded font-bold text-purple-900">
                ✅ Total Kolaborasi Tim = {kolaborasiTimTotal} / 100
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
                      <td className="border border-gray-300 p-2">Struktur Presentasi</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{strukturPresentasiTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Teknik Penyampaian</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{teknikPenyampaianTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Penguasaan Materi</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{penguasaanMateriTotal}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Kolaborasi Tim</td>
                      <td className="border border-gray-300 p-2 text-center">100</td>
                      <td className="border border-gray-300 p-2 text-center font-bold">{kolaborasiTimTotal}</td>
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

            {/* 💬 FEEDBACK UMUM UNTUK TIM */}
            <div className="space-y-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <h3 className="font-bold text-lg text-yellow-900">💬 FEEDBACK UMUM UNTUK TIM</h3>
              <label className="text-sm font-medium text-yellow-800">
                Tulis 2–3 kalimat umpan balik menyeluruh yang membangun
              </label>
              <Textarea
                placeholder="Contoh: 'Tim menunjukkan penguasaan materi yang kuat dan kerja sama yang baik, namun teknik penyampaian masih perlu ditingkatkan agar lebih menarik bagi audiens. Saran: latih intonasi dan ekspresi wajah saat presentasi.'"
                value={scoringForm.feedback}
                onChange={(e) => setScoringForm(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                className="text-sm"
              />
            </div>

            {/* Info untuk juri */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">✅ CATATAN UNTUK JURI</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Gunakan penilaian objektif dan adil. Jangan memberi skor maksimal kecuali benar-benar memenuhi semua aspek.
                    Umpan balik harus spesifik — hindari kata umum seperti "bagus" atau "kurang".
                  </p>
                </div>
              </div>
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
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
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