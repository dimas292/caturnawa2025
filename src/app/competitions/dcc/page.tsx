import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  User,
  Calendar,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Image as ImageIcon,
  Video,
  Upload
} from "lucide-react"

export default function DCCPage() {
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
            <h1 className="text-4xl font-bold">DCC</h1>
            <Badge className="bg-orange-500">Digital Creative</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Digital Creative Competition
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm font-semibold">Participant</p>
                <p className="text-xs text-muted-foreground">Individual</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-semibold">Registration Fee</p>
                <p className="text-xs text-muted-foreground">Rp 65.000</p>
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
              <CardTitle>About DCC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Digital Creative Competition (DCC) adalah kompetisi kreativitas digital yang terdiri dari dua kategori: Infografis dan Short Video. Kompetisi ini dirancang untuk mengasah kemampuan desain, storytelling, dan kreativitas digital peserta.
              </p>
              <p>
                Peserta dapat memilih salah satu atau kedua kategori. Setiap karya akan dinilai berdasarkan kreativitas, kualitas teknis, dan penyampaian pesan yang efektif.
              </p>
            </CardContent>
          </Card>

          {/* Competition Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Competition Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Infografis */}
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold text-lg">Kategori 1: Infografis</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Buat desain infografis yang informatif dan menarik dengan tema yang telah ditentukan.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Spesifikasi File:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>Format: JPG atau PNG</li>
                    <li>Ukuran maksimal: 10MB</li>
                    <li>Resolusi minimal: 1080x1920px (portrait) atau 1920x1080px (landscape)</li>
                    <li>Resolusi direkomendasikan: 300 DPI</li>
                    <li>Color mode: RGB</li>
                  </ul>
                </div>
              </div>

              {/* Short Video */}
              <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold text-lg">Kategori 2: Short Video</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Buat video pendek yang kreatif dan engaging dengan tema yang telah ditentukan.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Spesifikasi File:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>Format: MP4 atau MOV</li>
                    <li>Ukuran maksimal: 100MB</li>
                    <li>Durasi: Maksimal 3 menit</li>
                    <li>Resolusi minimal: 720p (1280x720)</li>
                    <li>Resolusi direkomendasikan: 1080p (1920x1080)</li>
                    <li>Frame rate: 24fps, 30fps, atau 60fps</li>
                    <li>Audio: Stereo, bitrate minimal 128kbps</li>
                  </ul>
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
                      <p className="text-sm font-medium">Work Submission</p>
                      <p className="text-xs text-muted-foreground">Upload your work before Oct 28, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Judging Period</p>
                      <p className="text-xs text-muted-foreground">Nov 1-5, 2025</p>
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
              <div>
                <h4 className="font-semibold mb-2">Infografis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Creativity & Originality</span>
                      <p className="text-xs text-muted-foreground">Uniqueness and innovation</p>
                    </div>
                    <Badge variant="outline">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Design Quality</span>
                      <p className="text-xs text-muted-foreground">Visual appeal and composition</p>
                    </div>
                    <Badge variant="outline">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Information Clarity</span>
                      <p className="text-xs text-muted-foreground">Message delivery and readability</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Theme Relevance</span>
                      <p className="text-xs text-muted-foreground">Alignment with theme</p>
                    </div>
                    <Badge variant="outline">15%</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Short Video</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Creativity & Concept</span>
                      <p className="text-xs text-muted-foreground">Story and originality</p>
                    </div>
                    <Badge variant="outline">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Technical Quality</span>
                      <p className="text-xs text-muted-foreground">Video and audio quality</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Editing & Cinematography</span>
                      <p className="text-xs text-muted-foreground">Visual storytelling</p>
                    </div>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">Theme Relevance</span>
                      <p className="text-xs text-muted-foreground">Alignment with theme</p>
                    </div>
                    <Badge variant="outline">20%</Badge>
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
                  <span>Can participate in one or both categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete registration and payment before deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Submit work before Oct 28, 2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>All work must be original and created by participant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Follow file specifications and naming conventions</span>
                </li>
              </ul>
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
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Infografis Category</p>
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
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-2">Short Video Category</p>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Create?</h3>
                <p className="text-muted-foreground">
                  Register now and showcase your digital creativity!
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

