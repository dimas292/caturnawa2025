'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Star
} from 'lucide-react'

interface SPCSubmission {
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
}

interface SemifinalEvaluation {
  submissionId: string
  penilaianKaryaTulisIlmiah: number // 0-100 score
  substansiKaryaTulisIlmiah: number // 0-100 score
  kualitasKaryaTulisIlmiah: number // 0-100 score
  catatanPenilaian: string
  catatanSubstansi: string
  catatanKualitas: string
}

interface SPCSemifinalEvaluationProps {
  submissions: SPCSubmission[]
  onEvaluate: (evaluation: SemifinalEvaluation) => void
  onDownload: (submissionId: string) => void
}

export default function SPCSemifinalEvaluation({
  submissions,
  onEvaluate,
  onDownload
}: SPCSemifinalEvaluationProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SPCSubmission | null>(null)
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const [evaluationForm, setEvaluationForm] = useState<SemifinalEvaluation>({
    submissionId: '',
    penilaianKaryaTulisIlmiah: 0,
    substansiKaryaTulisIlmiah: 0,
    kualitasKaryaTulisIlmiah: 0,
    catatanPenilaian: '',
    catatanSubstansi: '',
    catatanKualitas: ''
  })

  const handleEvaluate = (submission: SPCSubmission) => {
    setSelectedSubmission(submission)
    setEvaluationForm({
      submissionId: submission.id,
      penilaianKaryaTulisIlmiah: 0,
      substansiKaryaTulisIlmiah: 0,
      kualitasKaryaTulisIlmiah: 0,
      catatanPenilaian: '',
      catatanSubstansi: '',
      catatanKualitas: ''
    })
    setIsEvaluationOpen(true)
  }

  const handleSubmitEvaluation = () => {
    if (!selectedSubmission) return
    
    // Validation
    if (evaluationForm.penilaianKaryaTulisIlmiah < 1 || evaluationForm.penilaianKaryaTulisIlmiah > 100 ||
        evaluationForm.substansiKaryaTulisIlmiah < 1 || evaluationForm.substansiKaryaTulisIlmiah > 100 ||
        evaluationForm.kualitasKaryaTulisIlmiah < 1 || evaluationForm.kualitasKaryaTulisIlmiah > 100) {
      alert('Harap berikan nilai 1-100 untuk semua kriteria')
      return
    }
    
    onEvaluate(evaluationForm)
    setIsEvaluationOpen(false)
    setSelectedSubmission(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>
      case 'reviewed':
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Sudah Direview</Badge>
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Lolos</Badge>
      case 'not_qualified':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Tidak Lolos</Badge>
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true
    return submission.status === filterStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SPC Semifinal - Penilaian Karya</h2>
          <p className="text-gray-600 mt-1">
            Penilaian naskah peserta yang dinilai oleh juri
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Review</SelectItem>
              <SelectItem value="reviewed">Sudah Direview</SelectItem>
              <SelectItem value="qualified">Lolos</SelectItem>
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
                <p className="text-sm text-gray-600">Total Submission</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Review</p>
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
                <p className="text-sm text-gray-600">Lolos</p>
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
          <CardTitle>Daftar Submission</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Tidak ada submission ditemukan</p>
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
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{submission.fileName}</span>
                          <span>{submission.fileSize}</span>
                        </div>
                        
                        {submission.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            {submission.notes}
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
                            onClick={() => handleEvaluate(submission)}
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

      {/* Evaluation Dialog */}
      <Dialog open={isEvaluationOpen} onOpenChange={setIsEvaluationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle>Penilaian Karya - {selectedSubmission?.submissionTitle}</DialogTitle>
            <DialogDescription>
              Berikan penilaian untuk tiga kriteria utama evaluasi semifinal SPC
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedSubmission && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">Peserta:</p>
                <p className="font-medium">{selectedSubmission.participantName}</p>
                <p className="text-sm text-gray-600">{selectedSubmission.institution}</p>
              </div>
            )}
            
            {/* Penilaian Karya Tulis Ilmiah */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  1. Penilaian Karya Tulis Ilmiah
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Penilaian terhadap aspek format, sistematika penulisan, dan kaidah penulisan ilmiah
                </p>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Nilai Kuantitatif (0-100)
                </div>
              </div>
              {getScoreInput(
                evaluationForm.penilaianKaryaTulisIlmiah,
                (score) => setEvaluationForm(prev => ({ ...prev, penilaianKaryaTulisIlmiah: score })),
                'Penilaian Karya Tulis Ilmiah'
              )}

              <div className="mt-3">
                <label className="text-xs font-medium text-gray-700">
                  Nilai Kualitatif - Penilaian Karya Tulis Ilmiah
                </label>
                <Textarea
                  placeholder="Berikan feedback kualitatif untuk aspek format, sistematika, dan kaidah penulisan ilmiah..."
                  value={evaluationForm.catatanPenilaian}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, catatanPenilaian: e.target.value }))}
                  rows={2}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Substansi Karya Tulis Ilmiah */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  2. Substansi Karya Tulis Ilmiah
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Kedalaman analisis, relevansi topik, kekuatan argumen, dan kontribusi terhadap bidang ilmu
                </p>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Nilai Kuantitatif (0-100)
                </div>
              </div>
              {getScoreInput(
                evaluationForm.substansiKaryaTulisIlmiah,
                (score) => setEvaluationForm(prev => ({ ...prev, substansiKaryaTulisIlmiah: score })),
                'Substansi Karya Tulis Ilmiah'
              )}

              <div className="mt-3">
                <label className="text-xs font-medium text-gray-700">
                  Nilai Kualitatif - Substansi Karya Tulis Ilmiah
                </label>
                <Textarea
                  placeholder="Berikan feedback kualitatif untuk kedalaman analisis, relevansi topik, dan kontribusi ilmu..."
                  value={evaluationForm.catatanSubstansi}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, catatanSubstansi: e.target.value }))}
                  rows={2}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Kualitas Karya Tulis Ilmiah */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  3. Kualitas Karya Tulis Ilmiah
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Originalitas, inovasi, metodologi penelitian, dan kualitas referensi yang digunakan
                </p>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Nilai Kuantitatif (0-100)
                </div>
              </div>
              {getScoreInput(
                evaluationForm.kualitasKaryaTulisIlmiah,
                (score) => setEvaluationForm(prev => ({ ...prev, kualitasKaryaTulisIlmiah: score })),
                'Kualitas Karya Tulis Ilmiah'
              )}

              <div className="mt-3">
                <label className="text-xs font-medium text-gray-700">
                  Nilai Kualitatif - Kualitas Karya Tulis Ilmiah
                </label>
                <Textarea
                  placeholder="Berikan feedback kualitatif untuk originalitas, inovasi, metodologi penelitian, dan kualitas referensi..."
                  value={evaluationForm.catatanKualitas}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, catatanKualitas: e.target.value }))}
                  rows={2}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
            
            <Separator />
            
            
            {/* Info tentang ranking otomatis */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Sistem Ranking Otomatis</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Keputusan lolos/tidak lolos akan ditentukan otomatis berdasarkan ranking dari total nilai.
                    <strong> 8 peserta dengan nilai tertinggi</strong> akan lolos ke final.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEvaluationOpen(false)}
                  className="px-6 py-2"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
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