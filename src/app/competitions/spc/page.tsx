import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Upload
} from "lucide-react"

export default function SPCPage() {
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
            <h1 className="text-4xl font-bold">SPC</h1>
            <Badge className="bg-purple-500">Academic</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Scientific Paper Competition
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-semibold">Participant</p>
                <p className="text-xs text-muted-foreground">Individual</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-semibold">Registration Fee</p>
                <p className="text-xs text-muted-foreground">Rp 135.000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm font-semibold">Submission Deadline</p>
                <p className="text-xs text-muted-foreground">Oct 28, 2025</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-semibold">Format</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About SPC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Scientific Paper Competition (SPC) adalah kompetisi karya tulis ilmiah yang dirancang untuk mengasah kemampuan penelitian, analisis, dan penulisan akademik peserta. Kompetisi ini dilakukan secara online dengan format paper submission dan presentasi.
              </p>
              <p>
                Peserta akan menyusun karya tulis ilmiah dengan tema yang telah ditentukan, kemudian mengunggahnya ke platform Caturnawa untuk dinilai oleh juri profesional. Kompetisi terdiri dari dua tahap: Semifinal (penilaian paper) dan Final (presentasi langsung untuk 10 finalis terbaik).
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
                <h4 className="font-semibold mb-2">Paper Submission Requirements</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-sm">Paper Specifications</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Format: PDF</li>
                      <li>• Panjang: 8-12 halaman (tidak termasuk daftar pustaka)</li>
                      <li>• Ukuran maksimal: 5MB</li>
                      <li>• Font: Times New Roman, 12pt</li>
                      <li>• Spasi: 1.5</li>
                      <li>• Margin: 2.5cm (semua sisi)</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-sm">Content Requirements</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Bahasa: Indonesia atau Inggris</li>
                      <li>• Tema akan diumumkan setelah registrasi ditutup</li>
                      <li>• Harus original dan tidak plagiat</li>
                      <li>• Menggunakan citation style APA 7th edition</li>
                      <li>• Minimal 10 referensi (5 tahun terakhir)</li>
                      <li>• Struktur: Abstract, Introduction, Literature Review, Methodology, Results, Discussion, Conclusion, References</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Competition Stages</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Registration & Payment</p>
                      <p className="text-xs text-muted-foreground">Complete registration before Oct 10, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Theme Announcement</p>
                      <p className="text-xs text-muted-foreground">Theme will be announced on Oct 11, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Paper Submission (Semifinal)</p>
                      <p className="text-xs text-muted-foreground">Upload your paper before Oct 28, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Semifinal Evaluation</p>
                      <p className="text-xs text-muted-foreground">Paper evaluation by judges (Oct 29 - Nov 3, 2025)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Finalists Announcement</p>
                      <p className="text-xs text-muted-foreground">Top 10 finalists announced (Nov 4, 2025)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Final Presentation</p>
                      <p className="text-xs text-muted-foreground">Live presentation at UNAS (Nov 5, 2025)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Winner Announcement</p>
                      <p className="text-xs text-muted-foreground">Nov 6, 2025 at Awarding Ceremony</p>
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
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Semifinal (Paper Evaluation)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Originality & Innovation</span>
                      <p className="text-xs text-muted-foreground">Novelty of research and contribution to field</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Methodology</span>
                      <p className="text-xs text-muted-foreground">Research design and data collection methods</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Analysis & Discussion</span>
                      <p className="text-xs text-muted-foreground">Depth of analysis and interpretation</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Writing Quality</span>
                      <p className="text-xs text-muted-foreground">Structure, clarity, grammar, and citations</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Final (Presentation)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Presentation Skills</span>
                      <p className="text-xs text-muted-foreground">Clarity, confidence, and delivery</p>
                    </div>
                    <Badge variant="outline">40%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Q&A Response</span>
                      <p className="text-xs text-muted-foreground">Ability to answer questions from judges</p>
                    </div>
                    <Badge variant="outline">35%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Visual Aids</span>
                      <p className="text-xs text-muted-foreground">Quality and effectiveness of slides/materials</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
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
                  <span>Individual participation (no team required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Proficient in Indonesian or English</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete registration and payment before deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Submit video before Oct 28, 2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Own the rights to all content in the video</span>
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
                <div className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                  <div>
                    <p className="text-sm font-medium">Video Submission Deadline</p>
                    <p className="text-xs text-muted-foreground">Upload your speech video</p>
                  </div>
                  <span className="text-sm font-semibold">Oct 28, 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">Judging Period</p>
                    <p className="text-xs text-muted-foreground">Online judging</p>
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
                  <span className="text-sm font-medium">🏆 Favorite Speaker</span>
                  <span className="text-sm font-semibold">Certificate + Prize</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Inspire?</h3>
                <p className="text-muted-foreground">
                  Register now and share your voice with the world!
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

