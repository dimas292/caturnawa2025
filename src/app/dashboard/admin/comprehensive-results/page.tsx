import { Metadata } from 'next'
import ComprehensiveResultsTable from '@/components/admin/ComprehensiveResultsTable'

export const metadata: Metadata = {
  title: 'Comprehensive Tournament Results | UNAS FEST 2025',
  description: 'View comprehensive results for all tournament rooms with detailed scoring information'
}

export default function ComprehensiveResultsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Comprehensive Tournament Results</h1>
        <p className="text-gray-600 mt-2">
          View detailed results for all rooms including motion, teams, participants, scores, and judge assignments.
        </p>
      </div>
      
      <ComprehensiveResultsTable />
    </div>
  )
}