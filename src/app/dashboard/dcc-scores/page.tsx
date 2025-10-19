'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { LoadingPage } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DCCScoresView from '@/components/participant/dcc-scores-view'
import { ArrowLeft, TrendingUp, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DCCScoresPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchScores()
    }
  }, [user])

  const fetchScores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/participant/dcc/scores')
      
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        console.error('Failed to fetch DCC scores')
        setResults([])
      }
    } catch (error) {
      console.error('Error fetching DCC scores:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                Hasil Penilaian DCC
              </h1>
              <p className="text-gray-600 mt-2">
                Lihat hasil penilaian karya DCC Anda dari para juri
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Karya</p>
                    <p className="text-2xl font-bold">{results.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lolos Final</p>
                    <p className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.qualifiedToFinal).length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        results.reduce((sum, r) => sum + r.semifinal.averageScore, 0) / results.length
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scores Display */}
        <DCCScoresView results={results} />
      </div>
    </div>
  )
}
