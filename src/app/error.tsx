"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  HelpCircle,
  Bug
} from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Main Error Message */}
        <Card className="mb-8 border-red-200 dark:border-red-800 shadow-lg bg-background/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-600 dark:text-red-400">
              Something Went Wrong
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              We encountered an unexpected error while processing your request. Our team has been notified.
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details (Development):
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={reset}
                className="gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Actions */}
        <div className="grid grid-cols-1 gap-4 text-sm mb-8">
          <Link 
            href="/contact" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Get Help</span>
            <p className="text-xs text-muted-foreground mt-1">
              Contact our support team
            </p>
          </Link>
        </div>

       
      </div>
    </div>
  )
}
