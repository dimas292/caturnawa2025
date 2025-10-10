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
  Presentation,
  Users
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
  deskripsiKarya?: string
  semifinalScore?: number
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
  onScore: (score: DCCFinalScore) => void
  onDownload: (submissionId: string) => void
}

export default function DCCFinalScoring({
  finalists,
  onScore,
  onDownload
}: DCCFinalScoringProps) {
  const [selectedFinalist, setSelectedFinalist] = useState<DCCFinalist | null>(null)
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const [filterOrder, setFilterOrder] = useState<string>('all')
  
  const [scoringForm, setScoringForm] = useState<DCCFinalScore>({
    submissionId: '',
    strukturPresentasi: 0,
    teknikPenyampaian: 0,
    penguasaanMateri: 0,
    kolaborasiTeam: 0,
    feedback: ''
  })

  const handleScore = (finalist: DCCFinalist) => {
    setSelectedFinalist(finalist)
    setScoringForm({
      submissionId: finalist.id,
      strukturPresentasi: 0,
      teknikPenyampaian: 0,
      penguasaanMateri: 0,
      kolaborasiTeam: 0,
      feedback: ''
    })
    setIsScoringOpen(true)
  }

  const handleSubmitScore = () => {
    if (!selectedFinalist) return
    
    // Validation
    if (scoringForm.strukturPresentasi < 1 || scoringForm.strukturPresentasi > 100 ||
        scoringForm.teknikPenyampaian < 1 || scoringForm.teknikPenyampaian > 100 ||
        scoringForm.penguasaanMateri < 1 || scoringForm.penguasaanMateri > 100 ||
        scoringForm.kolaborasiTeam < 1 || scoringForm.kolaborasiTeam > 100) {
      alert('Harap berikan nilai 1-100 untuk semua kriteria')
      return
    }
    
    onScore(scoringForm)
    setIsScoringOpen(false)
    setSelectedFinalist(null)
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

  const totalScore = scoringForm.strukturPresentasi + scoringForm.teknikPenyampaian + 
                   scoringForm.penguasaanMateri + scoringForm.kolaborasiTeam

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">DCC Infografis - Penilaian Final</h2>
          <p className="text-gray-600 mt-1">
            Penilaian presentasi karya infografis peserta untuk tahap final
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterOrder} onValueChange={setFilterOrder}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter urutan presentasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Urutan</SelectItem>
              {Array.from(new Set(finalists.map(f => f.presentationOrder)))
                .sort((a, b) => a - b)
                .map(order => (
                  <SelectItem key={order} value={order.toString()}>
                    Urutan {order}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Finalis</p>
                <p className="text-2xl font-bold">{finalists.length}</p>
              </div>
              <Presentation className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Presentasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {/* This would be calculated based on actual scoring data */}
                  0
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
                <p className="text-sm text-gray-600">Menunggu Presentasi</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {finalists.length}
                </p>
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
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Urutan {finalist.presentationOrder}
                          </Badge>
                          <h3 className="font-semibold text-lg">{finalist.submissionTitle}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{finalist.participantName}</span>
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

                        {finalist.semifinalScore && (
                          <div className="mb-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              Skor Semifinal: {finalist.semifinalScore}/300
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>{finalist.fileName}</span>
                          <span>{finalist.fileSize}</span>
                        </div>

                        {finalist.deskripsiKarya && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Deskripsi:</strong> {finalist.deskripsiKarya}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownload(finalist.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleScore(finalist)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Nilai Presentasi
                        </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle>Penilaian Final - {selectedFinalist?.submissionTitle}</DialogTitle>
            <DialogDescription>
              Berikan penilaian untuk empat kriteria presentasi final (masing-masing 1-100 poin)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedFinalist && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">Peserta:</p>
                <p className="font-medium">{selectedFinalist.participantName}</p>
                <p className="text-sm text-gray-600">{selectedFinalist.institution}</p>
                <p className="text-sm text-purple-600 font-medium">Urutan Presentasi: {selectedFinalist.presentationOrder}</p>
              </div>
            )}
            
            {/* Struktur Presentasi */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  1. Struktur Presentasi (1-100 poin)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Penilaian terhadap alur presentasi, sistematika penyampaian, pembukaan, isi, dan penutup yang terstruktur
                </p>
              </div>
              {getScoreInput(
                scoringForm.strukturPresentasi,
                (score) => setScoringForm(prev => ({ ...prev, strukturPresentasi: score })),
                'Struktur Presentasi'
              )}
            </div>

            <Separator />

            {/* Teknik Penyampaian */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  2. Teknik Penyampaian (1-100 poin)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Kemampuan komunikasi, artikulasi, intonasi, gesture, kontak mata, dan kepercayaan diri dalam presentasi
                </p>
              </div>
              {getScoreInput(
                scoringForm.teknikPenyampaian,
                (score) => setScoringForm(prev => ({ ...prev, teknikPenyampaian: score })),
                'Teknik Penyampaian'
              )}
            </div>

            <Separator />

            {/* Penguasaan Materi */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  3. Penguasaan Materi (1-100 poin)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Pemahaman mendalam terhadap konten infografis, kemampuan menjawab pertanyaan, dan penjelasan detail
                </p>
              </div>
              {getScoreInput(
                scoringForm.penguasaanMateri,
                (score) => setScoringForm(prev => ({ ...prev, penguasaanMateri: score })),
                'Penguasaan Materi'
              )}
            </div>

            <Separator />

            {/* Kolaborasi Team */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  4. Kolaborasi Team (1-100 poin)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Kekompakan tim, pembagian peran yang efektif, koordinasi antar anggota, dan sinergi dalam presentasi
                </p>
              </div>
              {getScoreInput(
                scoringForm.kolaborasiTeam,
                (score) => setScoringForm(prev => ({ ...prev, kolaborasiTeam: score })),
                'Kolaborasi Team'
              )}
            </div>

            <Separator />

            {/* Total Score Display */}
            <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-purple-800">Total Skor Final:</span>
                <span className="text-xl font-bold text-purple-900">{totalScore}/400</span>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Feedback dan Komentar Presentasi
              </label>
              <Textarea
                placeholder="Berikan feedback konstruktif untuk peserta mengenai presentasi finalnya..."
                value={scoringForm.feedback}
                onChange={(e) => setScoringForm(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                className="text-sm"
              />
            </div>
            
            {/* Info tentang pemenang */}
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Penentuan Pemenang</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pemenang akan ditentukan berdasarkan kombinasi skor semifinal dan final.
                    Pastikan penilaian objektif dan adil untuk semua peserta.
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
