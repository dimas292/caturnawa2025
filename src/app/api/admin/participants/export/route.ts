import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For development/testing, temporarily skip auth check
    // if (!session?.user || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const competitionFilter = searchParams.get('competition')
    
    let whereCondition = {}
    if (competitionFilter && competitionFilter !== 'ALL') {
      whereCondition = {
        competition: {
          type: competitionFilter
        }
      }
    }

    const registrations = await prisma.registration.findMany({
      where: whereCondition,
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
              }
            }
          }
        },
        competition: {
          select: {
            name: true,
            shortName: true,
            type: true,
            category: true
          }
        },
        teamMembers: {
          include: {
            participant: {
              select: {
                fullName: true,
                email: true,
                institution: true,
                faculty: true,
                studentId: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            memberId: true,
            originalName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create CSV content with complete team data per registration
    let csvContent = 'No,ID Registrasi,Kompetisi,Kategori,Nama Tim,Status Registrasi,Leader/PIC,Email Leader,WhatsApp Leader,Institusi Leader,Fakultas Leader,NIM Leader,Anggota Tim,Email Anggota,Institusi Anggota,Judul Karya,Deskripsi Karya,Link Karya,Fase Pembayaran,Jumlah Pembayaran,Kode Pembayaran,Dokumen Upload,Tanggal Registrasi,Tanggal Verifikasi,Catatan Admin\n'
    
    let rowNumber = 1
    
    registrations.forEach(registration => {
      const leader = registration.participant
      
      // Format team members info
      const teamMembersInfo = registration.teamMembers
        .map(member => `${member.fullName} (${member.institution} - ${member.studentId})`)
        .join('; ')
      
      const teamMembersEmails = registration.teamMembers
        .map(member => member.email)
        .join('; ')
        
      const teamMembersInstitutions = registration.teamMembers
        .map(member => member.institution)
        .join('; ')
      
      // Format uploaded documents
      const uploadedDocs = registration.files
        .map(file => `${file.fileType}: ${file.originalName || file.fileName}`)
        .join('; ')
      
      const row = [
        rowNumber++,
        registration.id,
        registration.competition.name,
        registration.competition.category,
        registration.teamName || 'Individual',
        registration.status,
        leader.fullName,
        leader.email,
        leader.whatsappNumber,
        leader.institution,
        leader.faculty || '',
        leader.studentId || '',
        teamMembersInfo,
        teamMembersEmails,
        teamMembersInstitutions,
        registration.workTitle || '',
        registration.workDescription || '',
        registration.workLinkUrl || '',
        registration.paymentPhase,
        registration.paymentAmount,
        registration.paymentCode || '',
        uploadedDocs,
        registration.createdAt.toISOString().split('T')[0],
        registration.verifiedAt?.toISOString().split('T')[0] || '',
        registration.adminNotes || ''
      ].map(field => {
        const stringField = String(field)
        if (stringField.includes('"')) {
          return `"${stringField.replace(/"/g, '""')}"`
        } else if (stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField}"`
        }
        return stringField
      })
      
      csvContent += row.join(',') + '\n'
    })

    const filename = `participants_${competitionFilter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error("Error exporting participants:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}