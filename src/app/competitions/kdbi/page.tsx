import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Target
} from "lucide-react"

export default function KDBIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">KDBI</h1>
            <Badge className="bg-blue-500">Debate</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Kompetisi Debat Bahasa Indonesia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-semibold">Team Size</p>
                <p className="text-xs text-muted-foreground">2 People</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-semibold">Registration Fee</p>
                <p className="text-xs text-muted-foreground">Rp 250.000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-semibold">Competition Date</p>
                <p className="text-xs text-muted-foreground">Nov 1-5, 2025</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-semibold">Format</p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About KDBI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Kompetisi Debat Bahasa Indonesia (KDBI) adalah kompetisi debat yang menggunakan Bahasa Indonesia sebagai bahasa pengantar. Kompetisi ini dirancang untuk mengasah kemampuan berpikir kritis, argumentasi, dan public speaking peserta dalam konteks bahasa Indonesia.
              </p>
              <p>
                KDBI menggunakan format British Parliamentary (BP) dengan 4 tim dalam setiap ruangan debat. Peserta akan berdebat mengenai berbagai isu terkini yang relevan dengan konteks Indonesia dan global.
              </p>
            </CardContent>
          </Card>

          {/* Competition Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Competition Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">British Parliamentary (BP) Format</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Setiap ruangan debat terdiri dari 4 tim dengan 2 anggota per tim:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <p className="font-semibold text-sm text-green-700 dark:text-green-300">Government Side</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Opening Government (OG)</li>
                      <li>• Closing Government (CG)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                    <p className="font-semibold text-sm text-red-700 dark:text-red-300">Opposition Side</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Opening Opposition (OO)</li>
                      <li>• Closing Opposition (CO)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Competition Rounds</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Preliminary Rounds (3-4 rounds)</p>
                      <p className="text-xs text-muted-foreground">All teams compete in multiple rounds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Break Announcement</p>
                      <p className="text-xs text-muted-foreground">Top teams advance to elimination rounds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Semi-Finals</p>
                      <p className="text-xs text-muted-foreground">Top 8 teams compete</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Grand Final</p>
                      <p className="text-xs text-muted-foreground">Top 4 teams compete for championship</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Judging Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Judging Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-sm font-medium">Content & Arguments</span>
                  <Badge variant="outline">40%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-sm font-medium">Strategy & Teamwork</span>
                  <Badge variant="outline">30%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-sm font-medium">Style & Delivery</span>
                  <Badge variant="outline">20%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-sm font-medium">Points of Information (POI)</span>
                  <Badge variant="outline">10%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Participant Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Active high school or university students</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Team consists of exactly 2 members from the same institution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Proficient in Bahasa Indonesia</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete registration and payment before deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Attend all scheduled rounds and briefings</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Early Bird Registration</p>
                    <p className="text-xs text-muted-foreground">20% discount</p>
                  </div>
                  <span className="text-sm font-semibold">Sept 1-7, 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Phase 1 Registration</p>
                    <p className="text-xs text-muted-foreground">10% discount</p>
                  </div>
                  <span className="text-sm font-semibold">Sept 8-19, 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Final Registration</p>
                    <p className="text-xs text-muted-foreground">Normal price</p>
                  </div>
                  <span className="text-sm font-semibold">Sept 20 - Oct 10, 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">Competition Days</p>
                    <p className="text-xs text-muted-foreground">Offline event</p>
                  </div>
                  <span className="text-sm font-semibold">Nov 1-5, 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Prizes & Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <span className="text-sm font-medium">🥇 Champion</span>
                  <span className="text-sm font-semibold">Trophy + Certificate + Prize</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <span className="text-sm font-medium">🥈 Runner-up</span>
                  <span className="text-sm font-semibold">Trophy + Certificate + Prize</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <span className="text-sm font-medium">🥉 Third Place</span>
                  <span className="text-sm font-semibold">Trophy + Certificate + Prize</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <span className="text-sm font-medium">🏆 Best Speaker</span>
                  <span className="text-sm font-semibold">Trophy + Certificate</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Compete?</h3>
                <p className="text-muted-foreground">
                  Register now and showcase your debating skills in KDBI!
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/register">
                    <Button size="lg">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/guide">
                    <Button size="lg" variant="outline">
                      Registration Guide
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

