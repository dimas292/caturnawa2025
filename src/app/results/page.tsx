import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PublicResultsTable from '@/components/public/PublicResultsTable'

export const metadata: Metadata = {
  title: 'Tournament Results | UNAS FEST 2025',
  description: 'View live tournament results for KDBI and EDC debate competitions'
}

export default function PublicResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card pb-3">
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
            <div className="text-center space-y-2">
              <h1 className="text-xl font-semibold">Tournament Results</h1>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Live results from UNAS FEST 2025 debate competitions
              </p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span><strong>KDBI</strong> - Kompetisi Debate Bahasa Indonesia</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span><strong>EDC</strong> - English Debate Competition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-4 px-4">
        <PublicResultsTable />
      </div>

      {/* Footer Info */}
      <div className="border-t bg-card mt-6 pb-3">
        <div className="container mx-auto py-3 px-4">
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <div>
              Results are updated in real-time as matches are completed
            </div>
            <div className="text-xs">
              For detailed individual scores and feedback, participants can log in to their dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
