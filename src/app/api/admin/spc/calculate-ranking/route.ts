import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 })
    }

    // Get all reviewed submissions with scores
    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        status: 'REVIEWED',
        totalSemifinalScore: {
          not: null
        }
      },
      orderBy: {
        totalSemifinalScore: 'desc'
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    })

    if (submissions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada submission yang sudah dinilai'
      }, { status: 400 })
    }

    // Calculate ranking and determine top 6 finalists
    const updates = submissions.map((submission, index) => {
      const rank = index + 1
      const qualifiedToFinal = rank <= 6

      return prisma.sPCSubmission.update({
        where: { id: submission.id },
        data: {
          semifinalRank: rank,
          qualifiedToFinal,
          status: qualifiedToFinal ? 'QUALIFIED' : 'NOT_QUALIFIED'
        }
      })
    })

    // Execute all updates
    await Promise.all(updates)

    // Get updated data
    const finalists = submissions.slice(0, 6).map((sub, idx) => ({
      rank: idx + 1,
      participantName: sub.registration.participant?.fullName || 'Unknown',
      judulKarya: sub.judulKarya,
      totalScore: sub.totalSemifinalScore
    }))

    const notQualified = submissions.slice(6).map((sub, idx) => ({
      rank: idx + 7,
      participantName: sub.registration.participant?.fullName || 'Unknown',
      judulKarya: sub.judulKarya,
      totalScore: sub.totalSemifinalScore
    }))

    return NextResponse.json({
      success: true,
      message: `Ranking berhasil dihitung. ${finalists.length} peserta lolos ke final.`,
      finalists,
      notQualified,
      totalEvaluated: submissions.length
    })
  } catch (error) {
    console.error('Error calculating SPC ranking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view current ranking without updating
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or judge
    if (!['admin', 'judge'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all submissions with scores, ordered by total
    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        totalSemifinalScore: {
          not: null
        }
      },
      orderBy: {
        totalSemifinalScore: 'desc'
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        }
      }
    })

    const rankings = submissions.map((sub, index) => ({
      rank: index + 1,
      id: sub.id,
      participantName: sub.registration.participant?.fullName || 'Unknown',
      institution: sub.registration.participant?.institution || 'Unknown',
      judulKarya: sub.judulKarya,
      penilaianKaryaTulisIlmiah: sub.penilaianKaryaTulisIlmiah,
      substansiKaryaTulisIlmiah: sub.substansiKaryaTulisIlmiah,
      kualitasKaryaTulisIlmiah: sub.kualitasKaryaTulisIlmiah,
      totalScore: sub.totalSemifinalScore,
      currentRank: sub.semifinalRank,
      qualifiedToFinal: sub.qualifiedToFinal,
      status: sub.status,
      evaluatedAt: sub.evaluatedAt?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      rankings,
      totalEvaluated: rankings.length,
      finalistsCount: rankings.filter(r => r.qualifiedToFinal).length
    })
  } catch (error) {
    console.error('Error fetching SPC ranking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
