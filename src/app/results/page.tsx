import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PublicResultsTable from '@/components/public/PublicResultsTable'

export const metadata: Metadata = {
  title: 'Tournament Results | UNAS FEST 2025',
  description: 'View live tournament results for KDBI and EDC debate competitions'
}

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PublicResultsPage() {
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
              <h2 className="text-xl font-bold">Tournament Results</h2>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-6">
        <PublicResultsTable />
      </div>
    </div>
  )
}
