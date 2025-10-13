import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import GlobalLeaderboard from '@/components/public/GlobalLeaderboard'
import { notFound } from 'next/navigation'

type Props = {
  params: { competition: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const competitionName = params.competition.toUpperCase()
  
  const titles: Record<string, string> = {
    'KDBI': 'KDBI Leaderboard - Kompetisi Debat Bahasa Indonesia',
    'EDC': 'EDC Leaderboard - English Debate Competition',
    'SPC': 'SPC Leaderboard - Scientific Paper Competition',
    'DCC': 'DCC Leaderboard - Digital Content Competition'
  }
  
  return {
    title: titles[competitionName] || 'Tournament Leaderboard | UNAS FEST 2025',
    description: `Live leaderboard rankings for ${competitionName} competition`
  }
}

export default function CompetitionLeaderboardPage({ params }: Props) {
  const competition = params.competition.toUpperCase()
  
  // Validate competition
  const validCompetitions = ['KDBI', 'EDC', 'SPC', 'DCC']
  if (!validCompetitions.includes(competition)) {
    notFound()
  }
  
  const competitionNames: Record<string, string> = {
    'KDBI': 'KDBI',
    'EDC': 'EDC',
    'SPC': 'SPC',
    'DCC': 'DCC'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white dark:bg-gray-900 shadow-sm mb-6">
        <div className="container mx-auto py-4 px-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="text-center flex-1 pt-6">
              <h3 className="text-xl font-bold">{competitionNames[competition]}</h3>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-6">
        <GlobalLeaderboard defaultCompetition={competition} hideCompetitionSelector={true} />
      </div>
    </div>
  )
}
