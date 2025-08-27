// // src/app/dashboard/page.tsx
// "use client"

// import { useRequireRole } from "@/hooks/use-auth"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Navbar } from "@/components/ui/Navbar"
// import { LoadingPage } from "@/components/ui/loading"
// import Link from "next/link"
// import { 
//   User, 
//   FileText, 
//   CreditCard, 
//   Trophy, 
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   Calendar,
//   Target,
//   TrendingUp,
//   ArrowRight,
//   Bell,
//   BookOpen
// } from "lucide-react"

// export default function ParticipantDashboard() {
//   const { user, isLoading } = useRequireRole("participant")

//   if (isLoading) {
//     return <LoadingPage />
//   }

//   // Mock data - nanti akan diganti dengan real data
//   const registrationStatus = "not_registered" // not_registered, pending_payment, payment_uploaded, verified, rejected
//   const competitions = [
//     { 
//       name: "Kompetisi Debat Bahasa Indonesia", 
//       shortName: "KDBI",
//       price: "Rp 150.000", 
//       earlyBird: "Rp 150.000",
//       deadline: "31 Agustus 2025", 
//       registered: false,
//       phase: "Early Bird",
//       description: "Kompetisi debat dalam Bahasa Indonesia untuk mahasiswa"
//     },
//     { 
//       name: "English Debate Competition", 
//       shortName: "EDC",
//       price: "Rp 150.000", 
//       earlyBird: "Rp 150.000",
//       deadline: "31 Agustus 2025", 
//       registered: false,
//       phase: "Early Bird",
//       description: "English debate competition for university students"
//     },
//     { 
//       name: "Scientific Paper Competition", 
//       shortName: "SPC",
//       price: "Rp 115.000", 
//       earlyBird: "Rp 115.000",
//       deadline: "31 Agustus 2025", 
//       registered: false,
//       phase: "Early Bird",
//       description: "Scientific paper writing competition"
//     },
//     { 
//       name: "Digital Content - Infografis", 
//       shortName: "DCC Infografis",
//       price: "Rp 50.000", 
//       earlyBird: "Rp 50.000",
//       deadline: "31 Agustus 2025", 
//       registered: false,
//       phase: "Early Bird",
//       description: "Infographic design competition"
//     },
//     { 
//       name: "Digital Content - Short Video", 
//       shortName: "DCC Short Video",
//       price: "Rp 50.000", 
//       earlyBird: "Rp 50.000",
//       deadline: "31 Agustus 2025", 
//       registered: false,
//       phase: "Early Bird",
//       description: "Short video creation competition"
//     },
//   ]

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "verified":
//         return <CheckCircle className="h-4 w-4 text-green-500" />
//       case "pending_payment":
//       case "payment_uploaded":
//         return <Clock className="h-4 w-4 text-yellow-500" />
//       case "rejected":
//         return <XCircle className="h-4 w-4 text-red-500" />
//       default:
//         return <AlertCircle className="h-4 w-4 text-muted-foreground" />
//     }
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "verified":
//         return <Badge variant="success">Terverifikasi</Badge>
//       case "pending_payment":
//         return <Badge variant="warning">Menunggu Pembayaran</Badge>
//       case "payment_uploaded":
//         return <Badge variant="secondary">Menunggu Verifikasi</Badge>
//       case "rejected":
//         return <Badge variant="destructive">Ditolak</Badge>
//       default:
//         return <Badge variant="outline">Belum Daftar</Badge>
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
      
//       <div className="container mx-auto px-4 py-8 space-y-8">
//         {/* Header */}
//         <div className="space-y-2">
//           <h1 className="text-3xl font-bold tracking-tight">Dashboard Peserta</h1>
//           <p className="text-muted-foreground">
//             Selamat datang, {user?.name}! Kelola pendaftaran lomba Anda di sini.
//           </p>
//         </div>

//         <div className="grid gap-6 lg:grid-cols-4">
//           {/* Main Content - spans 3 columns */}
//           <div className="space-y-6 lg:col-span-3">
//             {/* Quick Stats */}
//             <div className="grid gap-4 md:grid-cols-3">
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center space-x-2">
//                     <Calendar className="h-5 w-5 text-primary" />
//                     <div>
//                       <p className="text-sm font-medium">Fase Saat Ini</p>
//                       <p className="text-2xl font-bold">Early Bird</p>
//                       <p className="text-xs text-muted-foreground">Berakhir 31 Agustus</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center space-x-2">
//                     <Target className="h-5 w-5 text-primary" />
//                     <div>
//                       <p className="text-sm font-medium">Sisa Waktu</p>
//                       <p className="text-2xl font-bold">5</p>
//                       <p className="text-xs text-muted-foreground">hari lagi</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Registration Status */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <FileText className="h-5 w-5" />
//                   <span>Status Pendaftaran Aktif</span>
//                 </CardTitle>
//                 <CardDescription>
//                   Informasi pendaftaran lomba yang sedang berjalan
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/50">
//                   <div className="flex items-center space-x-4">
//                     {getStatusIcon(registrationStatus)}
//                     <div>
//                       <p className="font-medium">
//                         {registrationStatus === "not_registered" ? "Belum Ada Pendaftaran" : "Status Pendaftaran"}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {registrationStatus === "not_registered" 
//                           ? "Anda belum mendaftar ke kompetisi manapun" 
//                           : "Kompetisi: -"
//                         }
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center space-x-3">
//                     {getStatusBadge(registrationStatus)}
//                     {registrationStatus === "not_registered" && (
//                       <Link href="/register">
//                         <Button>
//                           Daftar Sekarang
//                           <ArrowRight className="ml-2 h-4 w-4" />
//                         </Button>
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Available Competitions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Kompetisi Tersedia</CardTitle>
//                 <CardDescription>
//                   Pilih kompetisi yang ingin Anda ikuti
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {competitions.map((comp, index) => (
//                   <div key={index} className="group border rounded-lg p-6 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-2 flex-1">
//                         <div className="flex items-center space-x-3">
//                           <h3 className="font-semibold text-lg">{comp.name}</h3>
//                           <Badge variant="outline">{comp.phase}</Badge>
//                         </div>
//                         <p className="text-sm text-muted-foreground">{comp.description}</p>
                        
//                         <div className="flex items-center space-x-4 text-sm">
//                           <div className="flex items-center space-x-1">
//                             <CreditCard className="h-4 w-4" />
//                             <span className="font-medium">{comp.earlyBird}</span>
//                           </div>
//                           <div className="flex items-center space-x-1">
//                             <Clock className="h-4 w-4" />
//                             <span>Deadline: {comp.deadline}</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-col items-end space-y-2">
//                         {comp.registered ? (
//                           <Badge variant="success">Terdaftar</Badge>
//                         ) : (
//                           <Link href="/register">
//                             <Button size="sm" className="group-hover:shadow-sm">
//                               Daftar
//                             </Button>
//                           </Link>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <Target className="h-5 w-5" />
//                   <span>Aksi Cepat</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <Link href="/register" className="group">
//                     <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
//                       <CardContent className="p-6 text-center space-y-2">
//                         <Trophy className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
//                         <h3 className="font-medium">Daftar Lomba</h3>
//                         <p className="text-sm text-muted-foreground">Pilih kategori lomba yang ingin diikuti</p>
//                       </CardContent>
//                     </Card>
//                   </Link>
                  
//                   <Link href="/profile" className="group">
//                     <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
//                       <CardContent className="p-6 text-center space-y-2">
//                         <User className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
//                         <h3 className="font-medium">Update Profile</h3>
//                         <p className="text-sm text-muted-foreground">Kelola informasi pribadi Anda</p>
//                       </CardContent>
//                     </Card>
//                   </Link>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Profile Card */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base">Profile</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={user?.image || ""} />
//                     <AvatarFallback className="bg-primary text-primary-foreground">
//                       {user?.name?.charAt(0).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="space-y-1">
//                     <p className="font-medium text-sm">{user?.name}</p>
//                     <Badge variant="secondary" className="text-xs">
//                       {user?.role}
//                     </Badge>
//                   </div>
//                 </div>
                
//                 <div className="space-y-3 text-sm">
//                   <div>
//                     <p className="text-muted-foreground">Email</p>
//                     <p className="font-medium">{user?.email}</p>
//                   </div>
//                 </div>
                
//                 <Link href="/profile">
//                   <Button variant="outline" size="sm" className="w-full">
//                     <User className="h-4 w-4 mr-2" />
//                     Edit Profile
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             {/* Timeline */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base flex items-center space-x-2">
//                   <Calendar className="h-4 w-4" />
//                   <span>Timeline Penting</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Early Bird</span>
//                     <Badge variant="destructive" className="text-xs">5 hari lagi</Badge>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Phase 1</span>
//                     <span className="font-medium">1-13 Sep</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Phase 2</span>
//                     <span className="font-medium">14-26 Sep</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Upload Karya</span>
//                     <span className="font-medium">5-10 Okt</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Progress */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base flex items-center space-x-2">
//                   <TrendingUp className="h-4 w-4" />
//                   <span>Progress</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Profile Lengkap</span>
//                     <span className="font-medium">100%</span>
//                   </div>
//                   <div className="w-full bg-secondary rounded-full h-2">
//                     <div className="bg-primary h-2 rounded-full w-full"></div>
//                   </div>
//                 </div>
                
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Pendaftaran</span>
//                     <span className="font-medium">0%</span>
//                   </div>
//                   <div className="w-full bg-secondary rounded-full h-2">
//                     <div className="bg-primary h-2 rounded-full w-0"></div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Help & Support */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base flex items-center space-x-2">
//                   <BookOpen className="h-4 w-4" />
//                   <span>Bantuan</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Link href="/help" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
//                   <FileText className="h-4 w-4" />
//                   <span>Panduan Pendaftaran</span>
//                 </Link>
//                 <Link href="/faq" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
//                   <Bell className="h-4 w-4" />
//                   <span>FAQ</span>
//                 </Link>
//                 <Link href="/contact" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
//                   <User className="h-4 w-4" />
//                   <span>Hubungi Panitia</span>
//                 </Link>
//               </CardContent>
//             </Card>

//             {/* Notifications */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-base flex items-center space-x-2">
//                   <Bell className="h-4 w-4" />
//                   <span>Pengumuman</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="p-3 bg-muted/50 rounded-lg text-sm">
//                   <p className="font-medium mb-1">Early Bird berakhir!</p>
//                   <p className="text-muted-foreground text-xs">
//                     Hanya 5 hari tersisa untuk mendapatkan harga Early Bird.
//                   </p>
//                 </div>
//                 <div className="p-3 bg-muted/50 rounded-lg text-sm">
//                   <p className="font-medium mb-1">Timeline Update</p>
//                   <p className="text-muted-foreground text-xs">
//                     Cek jadwal terbaru untuk setiap kompetisi.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }