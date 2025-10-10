import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a judge
    if (!['judge', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      submissionId,
      // Desain Visual
      kerapianStruktur,
      komposisiGambar,
      kualitasEditing,
      // Isi/Pesan
      kesesuaianTema,
      kejelasanBahasa,
      dayaTarikMateri,
      // Originalitas
      orisinalitas,
      feedback
    } = body

    // Validate required fields
    const requiredFields = [
      kerapianStruktur, komposisiGambar, kualitasEditing,
      kesesuaianTema, kejelasanBahasa, dayaTarikMateri,
      orisinalitas
    ]

    if (!submissionId || requiredFields.some(field => field === undefined || field === null)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score ranges (1-100)
    for (const score of requiredFields) {
      if (score < 1 || score > 100) {
        return NextResponse.json(
          { error: 'All scores must be between 1 and 100' },
          { status: 400 }
        )
      }
    }

    // Calculate weighted totals according to rubric
    const desainVisualTotal = Math.round(
      (kerapianStruktur * 0.5) + (komposisiGambar * 0.25) + (kualitasEditing * 0.25)
    )
    const isiPesanTotal = Math.round(
      (kesesuaianTema * 0.3) + (kejelasanBahasa * 0.4) + (dayaTarikMateri * 0.3)
    )
    const originalitasTotal = orisinalitas

    const total = desainVisualTotal + isiPesanTotal + originalitasTotal

    // Upsert the score (update if exists, create if not)
    const score = await prisma.dCCSemifinalScore.upsert({
      where: {
        submissionId_judgeId: {
          submissionId: submissionId,
          judgeId: session.user.id
        }
      },
      update: {
        desainVisual: desainVisualTotal,
        isiPesan: isiPesanTotal,
        orisinalitas: originalitasTotal,
        total,
        feedback: feedback || null,
        judgeName: session.user.name || 'Unknown Judge'
      },
      create: {
        submissionId: submissionId,
        judgeId: session.user.id,
        judgeName: session.user.name || 'Unknown Judge',
        desainVisual: desainVisualTotal,
        isiPesan: isiPesanTotal,
        orisinalitas: originalitasTotal,
        total,
        feedback: feedback || null
      }
    })

    // Check if score qualifies for final (threshold: 75% = 225/300)
    const qualificationThreshold = 225 // 75% of 300
    const isQualified = total >= qualificationThreshold

    // Get next presentation order for qualified participants
    let presentationOrder = null
    if (isQualified) {
      const existingFinalists = await prisma.dCCSubmission.findMany({
        where: {
          qualifiedToFinal: true,
          registration: {
            competition: {
              type: {
                in: ['DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO']
              }
            }
          }
        },
        select: {
          presentationOrder: true
        }
      })

      // Find next available presentation order
      const usedOrders = existingFinalists
        .map(f => f.presentationOrder)
        .filter(order => order !== null)
        .sort((a, b) => a - b)

      presentationOrder = 1
      for (const order of usedOrders) {
        if (presentationOrder === order) {
          presentationOrder++
        } else {
          break
        }
      }
    }

    // Update submission status and qualification
    await prisma.dCCSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        status: isQualified ? 'QUALIFIED' : 'REVIEWED',
        qualifiedToFinal: isQualified,
        presentationOrder: isQualified ? presentationOrder : null,
        evaluatedAt: new Date(),
        evaluatedBy: session.user.id,
        feedback: feedback || null
      }
    })

    return NextResponse.json({
      success: true,
      message: `DCC semifinal score saved successfully${isQualified ? ' - Peserta lolos ke final!' : ''}`,
      score,
      qualified: isQualified,
      presentationOrder: isQualified ? presentationOrder : null,
      qualificationThreshold
    })
  } catch (error) {
    console.error('Error saving DCC semifinal score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
