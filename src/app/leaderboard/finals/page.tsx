import FinalsLeaderboard from '@/components/public/FinalsLeaderboard'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pemenang Final - UNAS FEST 2025',
  description: 'Selamat kepada para pemenang final dari semua kompetisi UNAS FEST 2025 Caturnawa - SPC, DCC Infografis, DCC Short Video, KDBI, dan EDC',
}

export default function FinalsLeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Link href="/leaderboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Peringkat Penyisihan & Semifinal
          </Button>
        </Link>
        <Link href="/leaderboard/finals">
          <Button variant="default" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Pemenang Final
          </Button>
        </Link>
      </div>
      
      <FinalsLeaderboard />
    </div>
  )
}
