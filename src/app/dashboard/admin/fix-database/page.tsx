"use client"

import { useState } from "react"
import { useRequireRoles } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function FixDatabasePage() {
  useRequireRoles(["admin"])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; log: string; deletedCount?: number } | null>(null)

  async function runFix() {
    if (!confirm('Apakah Anda yakin ingin memperbaiki duplikat rounds di database? Ini akan menghapus round yang duplikat.')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/fix-duplicate-rounds', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fix database')
      }

      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        log: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Tools untuk memperbaiki masalah database
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Peringatan</AlertTitle>
        <AlertDescription>
          Tool ini akan menghapus duplicate rounds dari database. Pastikan Anda memahami apa yang akan dilakukan sebelum menjalankannya.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Fix Duplicate Rounds</CardTitle>
          <CardDescription>
            Menghapus round yang duplikat di database. Script ini akan:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Mencari round dengan roundNumber yang sama</li>
              <li>Menghapus round yang tidak memiliki "Sesi" dalam nama (jika ada yang punya)</li>
              <li>Menghapus round kosong (jika ada yang punya matches)</li>
              <li>Tidak akan menghapus round yang sudah ada scores</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runFix} 
            disabled={loading}
            variant="destructive"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memperbaiki Database...
              </>
            ) : (
              'Jalankan Fix Duplicate Rounds'
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Berhasil!' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {result.success && result.deletedCount !== undefined && (
                  <p className="font-semibold mb-2">
                    {result.deletedCount} duplicate rounds telah dihapus
                  </p>
                )}
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                  {result.log}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Kapan menggunakan tool ini?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Ketika mendapat error saat membuat room baru</li>
            <li>Ketika ada round dengan nama yang sama tapi session berbeda</li>
            <li>Setelah melakukan import data atau migration</li>
          </ul>
          <p className="mt-4">
            <strong>Aman dijalankan?</strong>
          </p>
          <p className="text-muted-foreground">
            Ya, script ini tidak akan menghapus round yang sudah memiliki scores. 
            Namun tetap disarankan untuk backup database sebelum menjalankan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
