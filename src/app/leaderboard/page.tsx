import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import GlobalLeaderboard from '@/components/public/GlobalLeaderboard'

export const metadata: Metadata = {
  title: 'Tournament Leaderboard | UNAS FEST 2025',
  description: 'Global leaderboard rankings for KDBI and EDC debate competitions with live standings'
}

export default function LeaderboardPage() {
  return <GlobalLeaderboard />
}