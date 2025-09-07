"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  RefreshCw,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface Registration {
  id: string
  teamName: string
  competition: {
    name: string
    type: string
    category: string
  }
  status: string
  teamMembers: any[]
  files: any[]
}

export default function UpdateDocumentsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [uploadModal, setUploadModal] = useState<{isOpen: boolean, fileType?: string}>({isOpen: false})
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchRegistrations = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch('/api/participant/registrations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
      
      const result = await response.json()
      if (result.success) {
        setRegistrations(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedRegistration) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('registrationId', selectedRegistration.id)
      formData.append('fileType', uploadModal.fileType || 'document')

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      if (result.success) {
        setUploadModal({isOpen: false})
        setUploadFile(null)
        await fetchRegistrations()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchRegistrations()
    }
  }, [isLoading, isAuthenticated])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case "PAYMENT_UPLOADED":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "PENDING_PAYMENT":
        return <Badge className="bg-orange-100 text-orange-800">Not Paid</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getCompetitionName = (type: string) => {
    switch (type) {
      case "KDBI": return "KDBI"
      case "EDC": return "EDC"
      case "SPC": return "SPC"
      case "DCC_INFOGRAFIS": return "DCC Infografis"
      case "DCC_SHORT_VIDEO": return "DCC Short Video"
      default: return type
    }
  }

  const getTeamDocuments = (competitionType: string) => {
    switch (competitionType) {
      case 'KDBI':
      case 'EDC':
        return ['delegationLetter', 'attendanceCommitmentLetter']
      default:
        return []
    }
  }

  const getMemberDocuments = (competitionType: string) => {
    const baseDocuments = ['ktm', 'photo', 'khs']
    
    switch (competitionType) {
      case 'KDBI':
      case 'EDC':
        return [...baseDocuments, 'socialMediaProof', 'twibbonProof', 'pddiktiProof', 'achievementsProof']
      case 'SPC':
        return [...baseDocuments, 'socialMediaProof', 'twibbonProof', 'pddiktiProof']
      case 'DCC_INFOGRAFIS':
      case 'DCC_SHORT_VIDEO':
        return [...baseDocuments, 'socialMediaProof', 'twibbonProof']
      default:
        return baseDocuments
    }
  }

  const getDocumentLabel = (docType: string) => {
    const labels: Record<string, string> = {
      'ktm': 'KTM (Kartu Tanda Mahasiswa)',
      'photo': 'Pas Foto 3x4',
      'khs': 'KHS (Kartu Hasil Studi)',
      'socialMediaProof': 'Bukti Follow Social Media',
      'twibbonProof': 'Bukti Upload Twibbon',
      'delegationLetter': 'Surat Delegasi Universitas',
      'attendanceCommitmentLetter': 'Surat Kesediaan Hadir',
      'pddiktiProof': 'Bukti PDDIKTI',
      'achievementsProof': 'Sertifikat Prestasi (Opsional)'
    }
    return labels[docType] || docType.replace(/([A-Z])/g, ' $1').trim()
  }

  if (isLoading) return <LoadingPage />

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to access your documents.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                <span>/</span>
                <span>Update Documents</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Update Documents</h1>
              <p className="text-muted-foreground">
                Upload and manage your competition documents
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Registrations List */}
        <div className="space-y-6">
          {isDataLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading your registrations...</p>
              </CardContent>
            </Card>
          ) : registrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Registrations Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't registered for any competitions yet.
                </p>
                <Button asChild>
                  <Link href="/register">Register for Competition</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            registrations.map((registration) => (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{getCompetitionName(registration.competition.type)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Team: {registration.teamName || 'Individual'} | Status: {getStatusBadge(registration.status)}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedRegistration(registration)}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Manage Documents
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Document Management Modal */}
        <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Documents - {selectedRegistration && getCompetitionName(selectedRegistration.competition.type)}
              </DialogTitle>
              <DialogDescription>
                Upload and manage required documents for your registration
              </DialogDescription>
            </DialogHeader>
            
            {selectedRegistration && (
              <Tabs defaultValue="team-documents" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="team-documents">Team Documents</TabsTrigger>
                  <TabsTrigger value="member-documents">Member Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="team-documents" className="space-y-4">
                  {getTeamDocuments(selectedRegistration.competition.type).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getTeamDocuments(selectedRegistration.competition.type).map((docType) => {
                        const hasFile = selectedRegistration.files?.some(f => f.fileType === docType && !f.memberId)
                        return (
                          <Card key={docType} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{getDocumentLabel(docType)}</h4>
                              {hasFile ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                            <div className="space-y-2">
                              {hasFile ? (
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                      const file = selectedRegistration.files?.find(f => f.fileType === docType && !f.memberId)
                                      if (file?.fileUrl) window.open(file.fileUrl, '_blank')
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUploadModal({isOpen: true, fileType: docType})}
                                  >
                                    <Upload className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setUploadModal({isOpen: true, fileType: docType})}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {docType === 'delegationLetter' && 'Surat delegasi resmi dari universitas'}
                              {docType === 'attendanceCommitmentLetter' && 'Surat kesediaan hadir untuk awarding'}
                            </p>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Team Documents Required</h3>
                      <p className="text-muted-foreground">
                        This competition doesn't require team-level documents.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="member-documents" className="space-y-4">
                  {selectedRegistration.teamMembers?.map((member, index) => (
                    <Card key={member.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {member.role === 'LEADER' ? 'Member 1' : `Member ${index + 1}`}: {member.fullName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {getMemberDocuments(selectedRegistration.competition.type).map((docType) => {
                            const memberFiles = selectedRegistration.files?.filter(f => f.memberId === member.id) || []
                            const hasFile = memberFiles.some(f => f.fileType === docType)
                            const isOptional = docType === 'achievementsProof'
                            return (
                              <Card key={docType} className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className="text-xs font-medium">{getDocumentLabel(docType)}</h5>
                                    {isOptional && (
                                      <span className="text-xs text-muted-foreground">(Optional)</span>
                                    )}
                                  </div>
                                  {hasFile ? (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  ) : isOptional ? (
                                    <div className="h-3 w-3" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-orange-600" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {hasFile ? (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                        onClick={() => {
                                          const file = memberFiles.find(f => f.fileType === docType)
                                          if (file?.fileUrl) window.open(file.fileUrl, '_blank')
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setUploadModal({isOpen: true, fileType: `${docType}_${member.id}`})}
                                      >
                                        <Upload className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs"
                                      onClick={() => setUploadModal({isOpen: true, fileType: `${docType}_${member.id}`})}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Upload
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Team Members</h3>
                      <p className="text-muted-foreground">
                        No team members found for this registration.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedRegistration(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload File Modal */}
        <Dialog open={uploadModal.isOpen} onOpenChange={(open) => setUploadModal({isOpen: open})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Select file to upload for {uploadModal.fileType ? getDocumentLabel(uploadModal.fileType.split('_')[0]) : ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: JPG, PNG, PDF | Max size: 5MB
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadModal({isOpen: false})
                  setUploadFile(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload}
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}