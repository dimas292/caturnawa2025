import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                            <h2 className="text-xl font-bold">Tournament Leaderboard</h2>
                        </div>
                        <div className="w-24"></div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto py-6 px-6">
                {children}
            </main>
        </div>
    )
}
