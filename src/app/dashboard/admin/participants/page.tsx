"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, RefreshCw, Eye, Download } from "lucide-react"
import Link from "next/link"

export default function ParticipantsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [selectedCompetition, setSelectedCompetition] = useState<string>("ALL")
  const [allParticipants, setAllParticipants] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isLoading2, setIsLoading2] = useState(false)
  const [detailModal, setDetailModal] = useState<{isOpen: boolean, participant: any}>({isOpen: false, participant: null})

  const isAdmin = user?.role === "admin"

  const fetchAllParticipants = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetch(`/api/admin/participants?competition=ALL`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
      
      const result = await response.json()
      if (result.success) {
        setAllParticipants(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      setAllParticipants([])
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleStatusChange = async (participantId: string, newStatus: string) => {
    setIsLoading2(true)
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      const result = await response.json()
      if (result.success) {
        await fetchAllParticipants()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update participant status')
    } finally {
      setIsLoading2(false)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      fetchAllParticipants()
    }
  }, [isLoading, isAuthenticated, isAdmin])

  const filteredParticipants = selectedCompetition === "ALL" 
    ? allParticipants 
    : allParticipants.filter(p => p.competition.type === selectedCompetition)

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

  const getCompetitionName = (code: string) => {
    switch (code) {
      case "KDBI": return "KDBI"
      case "EDC": return "EDC"
      case "SPC": return "SPC"
      case "DCC_INFOGRAFIS": return "DCC Infografis"
      case "DCC_SHORT_VIDEO": return "DCC Short Video"
      default: return code
    }
  }

  if (isLoading) return <LoadingPage />

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Admin access required</p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
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
                <Link href="/dashboard/admin" className="hover:text-primary">Admin</Link>
                <span>/</span>
                <span>Participants</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Participants</h1>
              <p className="text-muted-foreground">
                View and manage all competition participants
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard/admin'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Participants List</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredParticipants.length} registrations found
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter Competition" />
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
                <Button variant="outline" size="sm" onClick={fetchAllParticipants}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDataLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading participants...
                    </TableCell>
                  </TableRow>
                ) : filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No participants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{participant.leaderName}</div>
                          <div className="text-xs text-muted-foreground">{participant.leaderEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {participant.teamName && participant.teamName !== 'Individual' 
                            ? participant.teamName 
                            : <span className="text-muted-foreground italic">Individual</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>{getCompetitionName(participant.competition.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(participant.status)}
                          {(participant.status === "PAYMENT_UPLOADED" || participant.status === "PENDING_PAYMENT") && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs text-green-600 border-green-600"
                                onClick={() => handleStatusChange(participant.id, "VERIFIED")}
                                disabled={isLoading2}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs text-red-600 border-red-600"
                                onClick={() => handleStatusChange(participant.id, "REJECTED")}
                                disabled={isLoading2}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          Rp {participant.paymentAmount?.toLocaleString("id-ID") || "0"}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {participant.paymentPhase}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDetailModal({isOpen: true, participant})}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal - Spreadsheet Style */}
        <Dialog open={detailModal.isOpen} onOpenChange={(open) => setDetailModal({isOpen: open, participant: null})}>
          <DialogContent className="max-w-full w-[95vw] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Participant Details - {detailModal.participant?.leaderName}</DialogTitle>
              <DialogDescription>
                Registration ID: {detailModal.participant?.id} | {getCompetitionName(detailModal.participant?.competition?.type)}
              </DialogDescription>
            </DialogHeader>
            
            {detailModal.participant && (
              <div className="space-y-4">
                {/* Basic Information Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                    Basic Information
                  </div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-48 bg-gray-50 dark:bg-gray-900">Full Name</TableCell>
                        <TableCell>{detailModal.participant.leaderName}</TableCell>
                        <TableCell className="font-medium w-48 bg-gray-50 dark:bg-gray-900">Email</TableCell>
                        <TableCell>{detailModal.participant.leaderEmail}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">WhatsApp</TableCell>
                        <TableCell>{detailModal.participant.whatsappNumber || 'N/A'}</TableCell>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Institution</TableCell>
                        <TableCell>{detailModal.participant.institution}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Faculty</TableCell>
                        <TableCell>{detailModal.participant.faculty || 'N/A'}</TableCell>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Registration Date</TableCell>
                        <TableCell>{new Date(detailModal.participant.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Competition & Payment Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                    Competition & Payment Details
                  </div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-48 bg-gray-50 dark:bg-gray-900">Competition</TableCell>
                        <TableCell>{detailModal.participant.competition.name}</TableCell>
                        <TableCell className="font-medium w-48 bg-gray-50 dark:bg-gray-900">Category</TableCell>
                        <TableCell>{detailModal.participant.competition.category}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Team Name</TableCell>
                        <TableCell>{detailModal.participant.teamName || 'Individual'}</TableCell>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Status</TableCell>
                        <TableCell>{getStatusBadge(detailModal.participant.status)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Payment Phase</TableCell>
                        <TableCell>{detailModal.participant.paymentPhase}</TableCell>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Amount</TableCell>
                        <TableCell className="font-medium text-green-600">Rp {detailModal.participant.paymentAmount?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Payment Code</TableCell>
                        <TableCell className="font-mono text-sm">{detailModal.participant.paymentCode || 'N/A'}</TableCell>
                        <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Agreement</TableCell>
                        <TableCell>
                          <Badge variant={detailModal.participant.agreementAccepted ? "default" : "destructive"}>
                            {detailModal.participant.agreementAccepted ? 'Accepted' : 'Not Accepted'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Team Members Table */}
                {detailModal.participant.teamMembers && detailModal.participant.teamMembers.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                      Team Members ({detailModal.participant.teamMembers.length})
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-900">
                          <TableHead>Role</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Student ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailModal.participant.teamMembers.map((member: any, index: number) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {member.role === 'LEADER' ? 'Leader' : `Member ${index + 1}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{member.fullName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                            <TableCell className="text-sm">{member.phone}</TableCell>
                            <TableCell className="text-sm">{member.institution}</TableCell>
                            <TableCell className="text-sm font-mono">{member.studentId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Work Submission Table */}
                {(detailModal.participant.workTitle || detailModal.participant.workDescription) && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                      Work Submission
                    </div>
                    <Table>
                      <TableBody>
                        {detailModal.participant.workTitle && (
                          <TableRow>
                            <TableCell className="font-medium w-32 bg-gray-50 dark:bg-gray-900">Title</TableCell>
                            <TableCell>{detailModal.participant.workTitle}</TableCell>
                          </TableRow>
                        )}
                        {detailModal.participant.workDescription && (
                          <TableRow>
                            <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Description</TableCell>
                            <TableCell>{detailModal.participant.workDescription}</TableCell>
                          </TableRow>
                        )}
                        {detailModal.participant.workFileUrl && (
                          <TableRow>
                            <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">File</TableCell>
                            <TableCell>
                              <a 
                                href={detailModal.participant.workFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                View File
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                        {detailModal.participant.workLinkUrl && (
                          <TableRow>
                            <TableCell className="font-medium bg-gray-50 dark:bg-gray-900">Link</TableCell>
                            <TableCell>
                              <a 
                                href={detailModal.participant.workLinkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {detailModal.participant.workLinkUrl}
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Payment Proof */}
                {detailModal.participant.paymentProofUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                      Payment Proof
                    </div>
                    <div className="p-4 text-center">
                      <img 
                        src={detailModal.participant.paymentProofUrl} 
                        alt="Payment Proof" 
                        className="max-w-full h-auto max-h-80 mx-auto border rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {detailModal.participant.adminNotes && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                      Admin Notes
                    </div>
                    <div className="p-4">
                      <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-400">
                        {detailModal.participant.adminNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDetailModal({isOpen: false, participant: null})}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}