"use client"

import { useState, useEffect } from "react"
import { useRequireRole } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingPage } from "@/components/ui/loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download,
  Eye,
  Search,
  Filter,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  File as FileIcon
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DocumentData {
  registration: {
    id: string
    teamName: string
    leaderName: string
    competition: string
    status: string
  }
  teamMembers: Array<{
    id: string
    fullName: string
    email: string
    role: string
    position: number
    memberKey: string
  }>
  files: {
    teamFiles: Array<{
      id: string
      fileName: string
      originalName: string
      fileType: string
      fileUrl: string
      fileSize: number
      mimeType: string
      uploadedAt: string
      exists: boolean
    }>
    memberFiles: Record<string, Array<{
      fileType: string
      fileUrl: string
      originalName: string
      exists: boolean
      source?: string
    }>>
    workSubmission: Array<{
      id: string
      fileName: string
      originalName: string
      fileType: string
      fileUrl: string
      fileSize: number
      mimeType: string
      uploadedAt: string
      exists: boolean
    }>
  }
}

export default function JudgeDocumentsPage() {
  const { user, isLoading: authLoading } = useRequireRole("judge")
  
  const [participants, setParticipants] = useState<any[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<string>("")
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [competitionFilter, setCompetitionFilter] = useState("ALL")

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      setIsLoading(true)
      
      // Get all verified registrations
      const response = await fetch('/api/judge/participants')
      if (!response.ok) throw new Error('Failed to load participants')
      
      const data = await response.json()
      setParticipants(data.data.participants || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load participants')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDocuments = async (registrationId: string) => {
    try {
      setIsLoadingDocs(true)
      setError(null)
      
      const response = await fetch(`/api/admin/participants/${registrationId}/documents`)
      if (!response.ok) throw new Error('Failed to load documents')
      
      const data = await response.json()
      setDocumentData(data.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
      setDocumentData(null)
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const handleParticipantSelect = (registrationId: string) => {
    setSelectedParticipant(registrationId)
    loadDocuments(registrationId)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <FileIcon className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.leader.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompetition = competitionFilter === "ALL" || p.competition.type === competitionFilter
    return matchesSearch && matchesCompetition
  })

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Documents Review
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review participant documents and submissions
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Participants List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({filteredParticipants.length})
                </CardTitle>
                <CardDescription>Select a team to review documents</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by competition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Competitions</SelectItem>
                      <SelectItem value="KDBI">KDBI</SelectItem>
                      <SelectItem value="EDC">EDC</SelectItem>
                      <SelectItem value="SPC">SPC</SelectItem>
                      <SelectItem value="DCC_INFOGRAFIS">DCC Infografis</SelectItem>
                      <SelectItem value="DCC_SHORT_VIDEO">DCC Short Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Participants List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedParticipant === participant.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleParticipantSelect(participant.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{participant.teamName}</h4>
                          <p className="text-sm text-gray-500 truncate">{participant.leader.fullName}</p>
                          <p className="text-xs text-gray-400">{participant.competition.name}</p>
                        </div>
                        <Badge 
                          variant={participant.status === 'VERIFIED' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Documents */}
          <div className="lg:col-span-2">
            {!selectedParticipant ? (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a participant to view their documents</p>
                  </div>
                </CardContent>
              </Card>
            ) : isLoadingDocs ? (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 mb-4 animate-spin" />
                    <p>Loading documents...</p>
                  </div>
                </CardContent>
              </Card>
            ) : documentData ? (
              <div className="space-y-6">
                {/* Team Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{documentData.registration.teamName}</CardTitle>
                    <CardDescription>
                      Leader: {documentData.registration.leaderName} • {documentData.registration.competition}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Team Files */}
                {documentData.files.teamFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Team Documents ({documentData.files.teamFiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documentData.files.teamFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.mimeType)}
                              <div>
                                <p className="font-medium">{file.originalName}</p>
                                <p className="text-sm text-gray-500">
                                  {file.fileType} • {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.exists ? (
                                <Badge variant="default">Available</Badge>
                              ) : (
                                <Badge variant="destructive">Missing</Badge>
                              )}
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(file.fileUrl, '_blank')}
                                disabled={!file.exists}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Member Files */}
                {Object.entries(documentData.files.memberFiles).map(([memberKey, files]) => {
                  const member = documentData.teamMembers.find(m => m.memberKey === memberKey)
                  if (!member || files.length === 0) return null

                  return (
                    <Card key={memberKey}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {member.fullName} Documents ({files.length})
                        </CardTitle>
                        <CardDescription>Position {member.position} • {member.role}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileIcon className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">{file.originalName}</p>
                                  <p className="text-sm text-gray-500">{file.fileType}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.exists ? (
                                  <Badge variant="default">Available</Badge>
                                ) : (
                                  <Badge variant="destructive">Missing</Badge>
                                )}
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(file.fileUrl, '_blank')}
                                  disabled={!file.exists}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Work Submissions */}
                {documentData.files.workSubmission.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Work Submissions ({documentData.files.workSubmission.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documentData.files.workSubmission.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.mimeType)}
                              <div>
                                <p className="font-medium">{file.originalName}</p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.exists ? (
                                <Badge variant="default">Available</Badge>
                              ) : (
                                <Badge variant="destructive">Missing</Badge>
                              )}
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(file.fileUrl, '_blank')}
                                disabled={!file.exists}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Documents */}
                {documentData.files.teamFiles.length === 0 && 
                 Object.keys(documentData.files.memberFiles).length === 0 &&
                 documentData.files.workSubmission.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center text-gray-500">
                        <FileText className="mx-auto h-8 w-8 mb-2" />
                        <p>No documents found for this participant</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>Failed to load documents</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => selectedParticipant && loadDocuments(selectedParticipant)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}