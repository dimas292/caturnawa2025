'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Judge {
  judgeId: string;
  judgeName: string;
  penilaianKaryaTulisIlmiah: number;
  substansiKaryaTulisIlmiah: number;
  kualitasKaryaTulisIlmiah: number;
  total: number;
  createdAt: string;
}

interface ScoreData {
  id: string;
  participantName: string;
  institution: string;
  email: string;
  judulKarya: string;
  judgesCount: number;
  judges: Judge[];
  avgPenilaian: number;
  avgSubstansi: number;
  avgKualitas: number;
  totalScore: number;
  status: string;
  qualifiedToFinal: boolean;
  createdAt: string;
}

export default function PublicSPCLeaderboardPage() {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/spc-semifinal-scores');
      const data = await response.json();
      
      if (data.success) {
        // Sort by total score and add rank
        const sortedScores = data.data
          .map((score: any) => ({
            ...score,
            totalScore: score.avgPenilaian + score.avgSubstansi + score.avgKualitas
          }))
          .sort((a: any, b: any) => b.totalScore - a.totalScore)
          .map((score: any, index: number) => ({
            ...score,
            rank: index + 1,
            isTop6: index < 6
          }));
        
        setScores(sortedScores);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      setError('Gagal memuat data leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const filteredScores = scores.filter(score => 
    score.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.judulKarya.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">SPC Leaderboard</CardTitle>
          <CardDescription>Daftar peringkat peserta SPC</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari peserta, institusi, atau judul karya..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institusi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Karya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScores.map((score) => {
                  const totalScore = score.avgPenilaian + score.avgSubstansi + score.avgKualitas;
                  return (
                    <tr 
                      key={score.id} 
                      className={`${score.rank <= 6 ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`font-medium ${score.rank <= 6 ? 'text-blue-600' : 'text-gray-900'}`}>
                            {score.rank}
                          </span>
                          {score.rank <= 6 && (
                            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                              Top 6
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{score.participantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{score.institution}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{score.judulKarya}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {totalScore.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
