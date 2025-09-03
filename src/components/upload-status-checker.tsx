"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface UploadStatus {
  field: string
  uploaded: boolean
  fileName: string | null
}

interface MemberStatus {
  memberIndex: number
  memberName: string
  role: string
  uploadStatus: UploadStatus[]
  totalRequired: number
  totalUploaded: number
  isComplete: boolean
}

interface UploadStatusResponse {
  registrationId: string
  competitionType: string
  teamName: string
  overallComplete: boolean
  members: MemberStatus[]
  summary: {
    totalMembers: number
    completedMembers: number
    totalRequiredFiles: number
    totalUploadedFiles: number
  }
}

interface UploadStatusCheckerProps {
  registrationId: string
}

const fieldLabels: Record<string, string> = {
  ktmFile: "KTM (Kartu Tanda Mahasiswa)",
  photoFile: "Pas Foto Formal",
  khsFile: "KHS (Kartu Hasil Studi)",
  pddiktiProof: "Screenshot Profil PDDikti",
  instagramFollowProof: "Bukti Follow Instagram",
  youtubeFollowProof: "Bukti Follow YouTube",
  tiktokFollowProof: "Bukti Follow TikTok",
  twibbonProof: "Bukti Upload Twibbon",
  delegationLetter: "Surat Pengantar Delegasi",
  attendanceCommitmentLetter: "Surat Pernyataan Kesediaan Hadir"
}

export function UploadStatusChecker({ registrationId }: UploadStatusCheckerProps) {
  const [status, setStatus] = useState<UploadStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/registration/upload-status?registrationId=${registrationId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch upload status')
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (registrationId) {
      fetchStatus()
    }
  }, [registrationId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Memeriksa status upload...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchStatus} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status Upload Dokumen - {status.teamName}</span>
            <Badge variant={status.overallComplete ? "default" : "secondary"}>
              {status.overallComplete ? "Lengkap" : "Belum Lengkap"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{status.summary.completedMembers}</div>
              <div className="text-sm text-muted-foreground">Anggota Selesai</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{status.summary.totalUploadedFiles}</div>
              <div className="text-sm text-muted-foreground">File Terupload</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{status.summary.totalRequiredFiles}</div>
              <div className="text-sm text-muted-foreground">Total Diperlukan</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((status.summary.totalUploadedFiles / status.summary.totalRequiredFiles) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Details */}
      {status.members.map((member) => (
        <Card key={member.memberIndex}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{member.role} - {member.memberName}</span>
              <Badge variant={member.isComplete ? "default" : "secondary"}>
                {member.totalUploaded}/{member.totalRequired} File
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {member.uploadStatus.map((file) => (
                <div key={file.field} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {file.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{fieldLabels[file.field] || file.field}</span>
                  </div>
                  {file.uploaded && file.fileName && (
                    <Badge variant="outline" className="text-xs">
                      {file.fileName.split('/').pop()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchStatus} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>
    </div>
  )
}
