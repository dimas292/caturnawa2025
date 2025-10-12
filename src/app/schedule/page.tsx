"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timeline } from "@/components/ui/timeline"
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Upload,
  Users,
  Award
} from "lucide-react"

export default function SchedulePage() {
  const timelineData = [
    {
      title: "1-7 Sept 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">Early Bird</Badge>
            <Badge variant="outline">20% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Early Bird Registration
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Get the best price! Register early and save 20% on all competition fees.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">KDBI & EDC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="line-through">Rp 250.000</span> → <span className="text-green-600 dark:text-green-400 font-bold">Rp 200.000</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">SPC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="line-through">Rp 135.000</span> → <span className="text-green-600 dark:text-green-400 font-bold">Rp 108.000</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-sm">DCC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="line-through">Rp 65.000</span> → <span className="text-green-600 dark:text-green-400 font-bold">Rp 52.000</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "8-19 Sept 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">Phase 1</Badge>
            <Badge variant="outline">10% OFF</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Phase 1 Registration
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Still get a discount! Register during Phase 1 and save 10% on registration fees.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Registration period: 12 days</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Payment verification: 1-2 business days</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "20 Sept - 10 Oct 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-orange-500 hover:bg-orange-600">Phase 2</Badge>
            <Badge variant="outline">Normal Price</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Phase 2 Registration (Extended)
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            Final chance to register! Normal pricing applies. Registration closes on October 10, 2025.
          </p>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
              ⚠️ Last day to register: October 10, 2025 at 23:59 WIB
            </p>
          </div>
        </div>
      )
    },
    {
      title: "11-28 Oct 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-purple-500 hover:bg-purple-600">Submission Period</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Work Submission Deadline
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            For DCC and SPC participants: Submit your work before the deadline!
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">DCC Infografis</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Upload your infographic design (JPG/PNG, max 10MB)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">DCC Short Video</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Upload your short video (MP4/MOV, max 100MB, max 3 minutes)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">SPC Video</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Upload your speech video (MP4/MOV, max 100MB, 5-7 minutes)
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1-5 Nov 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">Competition Week</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Competition & Judging Period
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            The main event! Competitions will be held and judges will evaluate all submissions.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">KDBI</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Offline debate competition
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-sm">EDC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Offline debate competition
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">SPC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Online judging of video submissions
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-sm">DCC</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Online judging of creative works
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6 Nov 2025",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Grand Finale</Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">
            Awarding Ceremony
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-4">
            The moment we've all been waiting for! Winners will be announced and awards will be presented.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Winner announcements for all categories</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Award presentation ceremony</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-yellow-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Celebration with all participants</span>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
              🎉 Congratulations to all participants and winners!
            </p>
          </div>
        </div>
      )
    }
  ]

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
          <h1 className="text-4xl font-bold mb-2">Event Schedule</h1>
          <p className="text-muted-foreground">
            Complete timeline for UNAS FEST 2025 from registration to awarding ceremony
          </p>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Overview</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <Calendar className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Registration Period</h3>
                <p className="text-sm text-muted-foreground">
                  September 1 - October 10, 2025
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Upload className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">Submission Deadline</h3>
                <p className="text-sm text-muted-foreground">
                  October 28, 2025 (DCC & SPC)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 text-yellow-500 mb-3" />
                <h3 className="font-semibold mb-2">Awarding Ceremony</h3>
                <p className="text-sm text-muted-foreground">
                  November 6, 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Timeline data={timelineData} />

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Participate?</h3>
                <p className="text-muted-foreground">
                  Don't miss out! Register now and be part of UNAS FEST 2025
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/register">
                    <Button size="lg">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/guide">
                    <Button size="lg" variant="outline">
                      View Registration Guide
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

