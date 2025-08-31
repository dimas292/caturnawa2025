import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Home, 
  Search, 
  ArrowLeft, 
  HelpCircle, 
  FileText,
  Users,
  Trophy
} from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-none">
            404
          </h1>
        </div>

        {/* Main Message */}
        <Card className="mb-8 border-0 shadow-lg bg-background/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              Oops! The page you're looking for seems to have wandered off to another competition.
            </p>
            
            {/* Search Suggestion */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-3">
                Maybe you're looking for one of these?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="gap-2 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <HelpCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Link 
            href="/guide" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Registration Guide</span>
            <p className="text-xs text-muted-foreground mt-1">
              Learn how to register for competitions
            </p>
          </Link>
          
          <Link 
            href="/faq" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">FAQ</span>
            <p className="text-xs text-muted-foreground mt-1">
              Find answers to common questions
            </p>
          </Link>
          
          <Link 
            href="/contact" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Contact Us</span>
            <p className="text-xs text-muted-foreground mt-1">
              Get help from our team
            </p>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact our support team
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Error ID: 404-{Date.now().toString().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  )
}
