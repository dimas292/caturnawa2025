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
  const [loadingKdbi, setLoadingKdbi] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [result, setResult] = useState<{ success: boolean; log: string; deletedCount?: number } | null>(null)
  const [kdbiResult, setKdbiResult] = useState<{ success: boolean; log: string; updatedCount?: number } | null>(null)
  const [resetResult, setResetResult] = useState<{ success: boolean; log: string; deletedCount?: number; skippedCount?: number } | null>(null)
  const [createResult, setCreateResult] = useState<{ success: boolean; log: string; created?: number; deleted?: number; skipped?: number } | null>(null)

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

  async function runKdbiFix() {
    if (!confirm('Apakah Anda yakin ingin memperbaiki mapping roundNumber dan session di KDBI? Ini akan mengupdate round yang salah mapping.')) {
      return
    }

    setLoadingKdbi(true)
    setKdbiResult(null)

    try {
      const res = await fetch('/api/admin/fix-kdbi-sessions', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fix KDBI sessions')
      }

      setKdbiResult(data)
    } catch (error) {
      setKdbiResult({
        success: false,
        log: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingKdbi(false)
    }
  }

  async function runReset() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua rounds di database? Ini akan menghapus semua rounds.')) {
      return
    }

    setLoadingReset(true)
    setResetResult(null)

    try {
      const res = await fetch('/api/admin/reset-rounds', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset rounds')
      }

      setResetResult(data)
    } catch (error) {
      setResetResult({
        success: false,
        log: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingReset(false)
    }
  }

  async function runCreateAllKdbi() {
    if (!confirm('Ini akan membuat semua 8 rounds KDBI PRELIMINARY dengan mapping yang benar.\n\nJika ada round dengan nama sama tapi mapping salah (tanpa scores), akan dihapus dan dibuat ulang.\n\nLanjutkan?')) {
      return
    }

    setLoadingCreate(true)
    setCreateResult(null)

    try {
      const res = await fetch('/api/admin/create-all-kdbi-rounds', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create KDBI rounds')
      }

      setCreateResult(data)
    } catch (error) {
      setCreateResult({
        success: false,
        log: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingCreate(false)
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
          <CardTitle className="text-orange-600">🔧 Fix KDBI Round Sessions</CardTitle>
          <CardDescription>
            Memperbaiki mapping roundNumber dan session yang salah di KDBI.
            <br /><br />
            <strong>Masalah yang diperbaiki:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Round 2 Session 1 seharusnya Round 1 Session 2</li>
              <li>Round 3 Session 1 seharusnya Round 2 Session 1</li>
              <li>Round 4 Session 1 seharusnya Round 2 Session 2</li>
              <li>Dan seterusnya...</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runKdbiFix} 
            disabled={loadingKdbi}
            variant="default"
            size="lg"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loadingKdbi ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memperbaiki KDBI Sessions...
              </>
            ) : (
              'Jalankan Fix KDBI Sessions'
            )}
          </Button>

          {kdbiResult && (
            <Alert variant={kdbiResult.success ? "default" : "destructive"}>
              {kdbiResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {kdbiResult.success ? 'Berhasil!' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {kdbiResult.success && kdbiResult.updatedCount !== undefined && (
                  <p className="font-semibold mb-2">
                    {kdbiResult.updatedCount} rounds telah diperbaiki
                  </p>
                )}
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                  {kdbiResult.log}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="text-green-600">✨ Create All KDBI Rounds (SOLUSI TERBAIK)</CardTitle>
          <CardDescription>
            <strong className="text-green-600">Solusi Otomatis:</strong> Buat semua 8 rounds KDBI PRELIMINARY dengan mapping yang benar.
            <br /><br />
            <strong>Yang akan dilakukan:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Cek setiap round (Round 1-4, Sesi 1-2)</li>
              <li>Jika sudah benar, skip</li>
              <li>Jika ada yang salah mapping (tanpa scores), hapus dan buat ulang</li>
              <li>Jika belum ada, buat baru</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runCreateAllKdbi} 
            disabled={loadingCreate}
            variant="default"
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {loadingCreate ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Rounds...
              </>
            ) : (
              '✨ Buat Semua KDBI Rounds'
            )}
          </Button>

          {createResult && (
            <Alert variant={createResult.success ? "default" : "destructive"}>
              {createResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {createResult.success ? 'Berhasil!' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {createResult.success && (
                  <div className="font-semibold mb-2 space-y-1">
                    <p>✅ Created: {createResult.created} rounds</p>
                    <p>🗑️ Deleted: {createResult.deleted} rounds (wrong mapping)</p>
                    <p>⏭️ Skipped: {createResult.skipped} rounds (already correct)</p>
                  </div>
                )}
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                  {createResult.log}
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
