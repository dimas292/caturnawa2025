'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react'

interface DCCScore {
  judgeName: string
  total: number
  feedback?: string
  createdAt: string
  breakdown: any
}

interface DCCResult {
  competitionName: string
  competitionType: string
  judulKarya: string
  deskripsiKarya?: string
  status: string
  qualifiedToFinal: boolean
  presentationOrder?: number
  semifinal: {
    scores: DCCScore[]
    averageScore: number
    totalJudges: number
  }
  final: {
    scores: DCCScore[]
    averageScore: number
    totalJudges: number
  }
}

interface DCCScoresViewProps {
  results: DCCResult[]
}

export default function DCCScoresView({ results }: DCCScoresViewProps) {
  const getStatusBadge = (status: string, qualified: boolean) => {
    if (qualified) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <Trophy className="w-3 h-3 mr-1" />
          Lolos Final
        </Badge>
      )
    }

    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Penilaian
          </Badge>
        )
      case 'REVIEWED':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sudah Dinilai
          </Badge>
        )
      case 'NOT_QUALIFIED':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Tidak Lolos
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Belum ada hasil penilaian</p>
          <p className="text-sm text-gray-400 mt-2">
            Hasil penilaian akan muncul setelah juri menilai karya Anda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => {
        const isShortVideo = result.competitionType === 'DCC_SHORT_VIDEO'
        const maxSemifinalScore = isShortVideo ? 1400 : 300
        const maxFinalScore = 400

        return (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{result.judulKarya}</CardTitle>
                  <p className="text-sm text-gray-600">{result.competitionName}</p>
                  {result.deskripsiKarya && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      {result.deskripsiKarya}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(result.status, result.qualifiedToFinal)}
                  {result.qualifiedToFinal && result.presentationOrder && (
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      Urutan Presentasi: {result.presentationOrder}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Semifinal Scores */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Penilaian Semifinal
                  </h3>
                  {result.semifinal.totalJudges > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Dinilai oleh {result.semifinal.totalJudges} juri
                      </p>
                      <p className={`text-2xl font-bold ${getScoreColor(result.semifinal.averageScore, maxSemifinalScore)}`}>
                        {result.semifinal.averageScore} / {maxSemifinalScore}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({Math.round((result.semifinal.averageScore / maxSemifinalScore) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>

                {result.semifinal.scores.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Belum ada penilaian semifinal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.semifinal.scores.map((score, idx) => (
                      <Card key={idx} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">{score.judgeName}</span>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${getScoreColor(score.total, maxSemifinalScore)}`}>
                                {score.total}
                              </p>
                              <p className="text-xs text-gray-500">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(score.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            {Object.entries(score.breakdown).map(([key, value]) => (
                              <div key={key} className="bg-white p-2 rounded text-center">
                                <p className="text-xs text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-lg font-semibold">{value as number}</p>
                              </div>
                            ))}
                          </div>

                          {score.feedback && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 mb-1">
                                    Feedback Juri:
                                  </p>
                                  <p className="text-sm text-gray-700">{score.feedback}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Final Scores */}
              {result.qualifiedToFinal && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Penilaian Final
                      </h3>
                      {result.final.totalJudges > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Dinilai oleh {result.final.totalJudges} juri
                          </p>
                          <p className={`text-2xl font-bold ${getScoreColor(result.final.averageScore, maxFinalScore)}`}>
                            {result.final.averageScore} / {maxFinalScore}
                          </p>
                          <p className="text-xs text-gray-500">
                            ({Math.round((result.final.averageScore / maxFinalScore) * 100)}%)
                          </p>
                        </div>
                      )}
                    </div>

                    {result.final.scores.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm">Belum ada penilaian final</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {result.final.scores.map((score, idx) => (
                          <Card key={idx} className="bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium">{score.judgeName}</span>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xl font-bold ${getScoreColor(score.total, maxFinalScore)}`}>
                                    {score.total}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {new Date(score.createdAt).toLocaleDateString('id-ID')}
                                  </p>
                                </div>
                              </div>

                              {/* Score Breakdown */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                {Object.entries(score.breakdown).map(([key, value]) => (
                                  <div key={key} className="bg-white p-2 rounded text-center">
                                    <p className="text-xs text-gray-600 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-lg font-semibold">{value as number}</p>
                                  </div>
                                ))}
                              </div>

                              {score.feedback && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold text-blue-700 mb-1">
                                        Feedback Juri:
                                      </p>
                                      <p className="text-sm text-gray-700">{score.feedback}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
