import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create sample teams for testing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get competitions
    const kdbiet = await prisma.competition.findUnique({ where: { type: 'KDBI' } })
    const edc = await prisma.competition.findUnique({ where: { type: 'EDC' } })

    if (!kdbiet || !edc) {
      return NextResponse.json({ error: 'Competitions not found. Run seed first.' }, { status: 404 })
    }

    const createdTeams = []

    // Create sample KDBI teams
    for (let i = 1; i <= 12; i++) {
      // Create dummy user and participant
      const user = await prisma.user.create({
        data: {
          email: `kdbi_leader_${i}@test.com`,
          name: `KDBI Leader ${i}`,
          role: 'participant'
        }
      })

      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: `Leader KDBI ${i}`,
          email: `kdbi_leader_${i}@test.com`,
          phone: `08123456789${i}`,
          university: `Universitas ${i}`,
          faculty: `Fakultas ${i}`,
          major: `Jurusan ${i}`,
          studentId: `2023${i.toString().padStart(3, '0')}`,
          yearOfEntry: 2023,
          ktm: 'dummy_ktm.jpg',
          photo: 'dummy_photo.jpg',
          fullAddress: `Alamat lengkap ${i}`,
          birthDate: new Date('2000-01-01'),
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          experience: 'NONE'
        }
      })

      const registration = await prisma.registration.create({
        data: {
          competitionId: kdbiet.id,
          participantId: participant.id,
          teamName: `Team KDBI ${i}`,
          status: 'VERIFIED', // Make it verified so it shows up
          finalPrice: 150000,
          teamMembers: {
            create: [
              {
                participantId: participant.id,
                fullName: `Leader KDBI ${i}`,
                position: 1
              },
              {
                participantId: participant.id, // In real scenario this would be different
                fullName: `Member KDBI ${i}`,
                position: 2
              }
            ]
          }
        }
      })

      createdTeams.push({ 
        competition: 'KDBI', 
        teamName: `Team KDBI ${i}`,
        id: registration.id 
      })
    }

    // Create sample EDC teams  
    for (let i = 1; i <= 8; i++) {
      const user = await prisma.user.create({
        data: {
          email: `edc_leader_${i}@test.com`,
          name: `EDC Leader ${i}`,
          role: 'participant'
        }
      })

      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          fullName: `Leader EDC ${i}`,
          email: `edc_leader_${i}@test.com`,
          phone: `08123456789${i}`,
          university: `University ${i}`,
          faculty: `Faculty ${i}`,
          major: `Major ${i}`,
          studentId: `2023${i.toString().padStart(3, '0')}`,
          yearOfEntry: 2023,
          ktm: 'dummy_ktm.jpg',
          photo: 'dummy_photo.jpg',
          fullAddress: `Full address ${i}`,
          birthDate: new Date('2000-01-01'),
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          experience: 'INTERMEDIATE'
        }
      })

      const registration = await prisma.registration.create({
        data: {
          competitionId: edc.id,
          participantId: participant.id,
          teamName: `Team EDC ${i}`,
          status: 'VERIFIED',
          finalPrice: 150000,
          teamMembers: {
            create: [
              {
                participantId: participant.id,
                fullName: `Leader EDC ${i}`,
                position: 1
              },
              {
                participantId: participant.id,
                fullName: `Member EDC ${i}`,
                position: 2
              }
            ]
          }
        }
      })

      createdTeams.push({ 
        competition: 'EDC', 
        teamName: `Team EDC ${i}`,
        id: registration.id 
      })
    }

    console.log(`Admin ${user.email} created ${createdTeams.length} sample teams for testing`)

    return NextResponse.json({
      success: true,
      message: `Created ${createdTeams.length} sample teams`,
      data: { 
        teams: createdTeams,
        stats: {
          KDBI: 12,
          EDC: 8,
          total: 20
        }
      }
    })

  } catch (error) {
    console.error('Error creating sample teams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create sample teams',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}