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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 pb-3">
        <div className="container mx-auto py-4 px-4">
          <div className="space-y-3">
            {/* Back Button */}
            <div className="flex justify-start">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            {/* Title Section */}
            <div className="text-center space-y-1">
              <h1 className="text-base font-medium tracking-tight">Tournament Leaderboard</h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Live global rankings for UNAS FEST 2025 debate competitions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <GlobalLeaderboard />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Rankings update as results are confirmed. Top 8 teams advance. Tiebreakers: Team Points → Avg. Speaker Points → Avg. Position.
          </p>
        </div>
      </footer>
    </div>
  )
}