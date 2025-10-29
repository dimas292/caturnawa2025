import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import GlobalLeaderboard from '@/components/public/GlobalLeaderboard'
import SPCLeaderboard from '../spc/page'
import DCCLeaderboard from '../dcc/page'
import DCCShortVideoLeaderboard from '../dcc-short-video/page'
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
  const slug = params.competition.toLowerCase()

  // Map slugs to canonical competitions / components
  const isSPC = ['spc', 'SPC'.toLowerCase()].includes(slug)
  const isDCCInfografis = ['dcc', 'dcc-infografis', 'dcc_infografis', 'dccinfografis'].includes(slug)
  const isDCCShortVideo = ['dcc-short-video', 'dcc-shortvideo', 'dcc_short_video', 'dccshortvideo'].includes(slug)
  const isKDBI = ['kdbi', 'kdbi'].includes(slug)
  const isEDC = ['edc'].includes(slug)

  if (!isSPC && !isDCCInfografis && !isDCCShortVideo && !isKDBI && !isEDC) {
    notFound()
  }

  return (
    <>
      {isSPC ? (
        <SPCLeaderboard />
      ) : isDCCInfografis ? (
        <DCCLeaderboard />
      ) : isDCCShortVideo ? (
        <DCCShortVideoLeaderboard />
      ) : isKDBI ? (
        <GlobalLeaderboard defaultCompetition="KDBI" hideCompetitionSelector={true} />
      ) : isEDC ? (
        <GlobalLeaderboard defaultCompetition="EDC" hideCompetitionSelector={true} />
      ) : null}
    </>
  )
}
