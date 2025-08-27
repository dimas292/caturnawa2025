// src/app/unauthorized/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-6">
            <ShieldX size={64} className="text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Akses Ditolak
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
            
            <Link href="/auth/signin" className="block">
              <Button variant="outline" className="w-full">
                Sign In dengan Akun Lain
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}