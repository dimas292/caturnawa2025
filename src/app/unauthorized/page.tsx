import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Lock, 
  Home, 
  LogIn, 
  HelpCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-background to-yellow-50 dark:from-yellow-950/20 dark:via-background dark:to-yellow-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Unauthorized Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Main Message */}
        <Card className="mb-8 border-yellow-200 dark:border-yellow-800 shadow-lg bg-background/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">
              Access Denied
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have permission to access this page. Please sign in with the appropriate account or contact an administrator.
            </p>
            
            {/* Access Requirements */}
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                Access Requirements:
              </p>
              <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Valid authentication required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Appropriate role permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Account verification completed</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signin">
                <Button className="gap-2 w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-8">
          <Link 
            href="/auth/signup" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <LogIn className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Create Account</span>
            <p className="text-xs text-muted-foreground mt-1">
              Register for competitions
            </p>
          </Link>
          
          <Link 
            href="/guide" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">View Guide</span>
            <p className="text-xs text-muted-foreground mt-1">
              Learn about the platform
            </p>
          </Link>
          
          <Link 
            href="/contact" 
            className="group p-4 rounded-lg border border-muted hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Get Help</span>
            <p className="text-xs text-muted-foreground mt-1">
              Contact support team
            </p>
          </Link>
        </div>

        {/* Common Issues */}
        <Card className="mb-8 border-0 shadow-lg bg-background/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Common Access Issues
            </h3>
            <div className="space-y-3 text-sm text-left">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Session Expired</p>
                  <p className="text-muted-foreground">Your login session may have expired. Please sign in again.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Insufficient Permissions</p>
                  <p className="text-muted-foreground">Your account may not have the required role for this page.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Account Not Verified</p>
                  <p className="text-muted-foreground">Your account may need to be verified by an administrator.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            If you believe you should have access to this page, please contact our support team
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Error Code: 403-UNAUTHORIZED-{Date.now().toString().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  )
}
