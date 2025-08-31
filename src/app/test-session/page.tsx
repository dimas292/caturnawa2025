"use client"

import { useSessionManager } from "@/hooks/use-session-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading"

export default function TestSessionPage() {
  const { 
    session, 
    status, 
    isRefreshing, 
    isExpiringSoon, 
    remainingTime, 
    refreshSession,
    lastRefreshTime 
  } = useSessionManager()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please sign in to test session management</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Session Management Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Current session details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg">{status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="text-lg">{session.user?.name || session.user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg">{session.user?.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expires</p>
                <p className="text-lg">
                  {session.expires ? new Date(session.expires).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Health</CardTitle>
            <CardDescription>Session refresh and expiration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining Time</p>
                <p className={`text-lg ${remainingTime <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingTime} minutes
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className={`text-lg ${isExpiringSoon ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpiringSoon ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Refresh</p>
                <p className="text-lg">
                  {lastRefreshTime ? new Date(lastRefreshTime).toLocaleTimeString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Refresh Status</p>
                <p className="text-lg">
                  {isRefreshing ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Refreshing...
                    </span>
                  ) : (
                    'Idle'
                  )}
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={refreshSession} 
                disabled={isRefreshing}
                className="w-full"
              >
                {isRefreshing ? 'Refreshing...' : 'Manual Refresh Session'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Raw session data for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
