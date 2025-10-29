import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import GlobalLeaderboard from '@/components/public/GlobalLeaderboard'
import SPCLeaderboard from '../spc/page'
import DCCLeaderboard from '../dcc/page'
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
    <>
      {competition === 'SPC' ? (
        <SPCLeaderboard />
      ) : competition === 'DCC' ? (
        <DCCLeaderboard />
      ) : (
        <GlobalLeaderboard defaultCompetition={competition} hideCompetitionSelector={true} />
      )}
    </>
  )
}
