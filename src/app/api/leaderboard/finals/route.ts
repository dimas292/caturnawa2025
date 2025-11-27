import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch SPC Final Scores
    let spcWinners: any[] = []
    try {
      const spcSubmissions = await (prisma as any).sPCSubmission.findMany({
        where: {
          qualifiedToFinal: true,
          finalScores: {
            some: {}
          }
        },
        include: {
          registration: {
            include: {
              participant: {
                select: {
                  fullName: true,
                  institution: true
                }
              },
              teamMembers: {
                select: {
                  name: true
                }
              }
            }
          },
          finalScores: true
        }
      })

      spcWinners = spcSubmissions.map((submission: any) => {
        const scores = submission.finalScores
        const judgesCount = scores.length

        if (judgesCount === 0) return null

        const avgPemaparan = scores.reduce((sum: number, s: any) => sum + s.pemaparanMateriPresentasi, 0) / judgesCount
        const avgPertanyaan = scores.reduce((sum: number, s: any) => sum + s.pertanyaanJawaban, 0) / judgesCount
        const avgKesesuaian = scores.reduce((sum: number, s: any) => sum + s.aspekKesesuaianTema, 0) / judgesCount
        const totalScore = avgPemaparan + avgPertanyaan + avgKesesuaian

        const teamMembers = submission.registration.teamMembers?.map((m: any) => m.name).join(', ') || submission.registration.participant.fullName

        return {
          competitionType: 'SPC',
          competitionName: 'Scientific Paper Competition',
          participantName: teamMembers,
          institution: submission.registration.participant.institution,
          title: submission.judulKarya,
          totalScore,
          judgesCount,
          category: 'SPC'
        }
      }).filter(Boolean).sort((a: any, b: any) => (b?.totalScore || 0) - (a?.totalScore || 0)).slice(0, 10)
    } catch (error) {
      console.error('Error fetching SPC winners:', error)
    }

    // Fetch DCC Infografis Final Scores
    let dccInfografisWinners: any[] = []
    try {
      const dccInfografisSubmissions = await (prisma as any).dCCSubmission.findMany({
        where: {
          qualifiedToFinal: true,
          finalScores: {
            some: {}
          },
          registration: {
            competition: {
              type: 'DCC_INFOGRAFIS'
            }
          }
        },
        include: {
          registration: {
            include: {
              participant: {
                select: {
                  fullName: true,
                  institution: true
                }
              },
              teamMembers: {
                select: {
                  name: true
                }
              }
            }
          },
          finalScores: true
        }
      })

      dccInfografisWinners = dccInfografisSubmissions.map((submission: any) => {
        const scores = submission.finalScores
        const judgesCount = scores.length

        if (judgesCount === 0) return null

        const avgStruktur = scores.reduce((sum: number, s: any) => sum + s.strukturPresentasi, 0) / judgesCount
        const avgTeknik = scores.reduce((sum: number, s: any) => sum + s.teknikPenyampaian, 0) / judgesCount
        const avgPenguasaan = scores.reduce((sum: number, s: any) => sum + s.penguasaanMateri, 0) / judgesCount
        const avgKolaborasi = scores.reduce((sum: number, s: any) => sum + s.kolaborasiTeam, 0) / judgesCount
        const totalScore = avgStruktur + avgTeknik + avgPenguasaan + avgKolaborasi

        const teamMembers = submission.registration.teamMembers?.map((m: any) => m.name).join(', ') || submission.registration.participant.fullName

        return {
          competitionType: 'DCC_INFOGRAFIS',
          competitionName: 'DCC - Infografis',
          participantName: teamMembers,
          institution: submission.registration.participant.institution,
          title: submission.judulKarya,
          totalScore,
          judgesCount,
          category: 'DCC'
        }
      }).filter(Boolean).sort((a: any, b: any) => (b?.totalScore || 0) - (a?.totalScore || 0)).slice(0, 10)
    } catch (error) {
      console.error('Error fetching DCC Infografis winners:', error)
    }

    // Fetch DCC Short Video Final Scores
    let dccShortVideoWinners: any[] = []
    try {
      const dccShortVideoSubmissions = await (prisma as any).dCCSubmission.findMany({
        where: {
          qualifiedToFinal: true,
          registration: {
            competition: {
              type: 'DCC_SHORT_VIDEO'
            }
          }
        },
        include: {
          registration: {
            include: {
              participant: {
                select: {
                  fullName: true,
                  institution: true
                }
              },
              teamMembers: {
                select: {
                  name: true
                }
              }
            }
          },
          shortVideoScores: {
            where: {
              stage: 'FINAL'
            }
          }
        }
      })

      dccShortVideoWinners = dccShortVideoSubmissions.map((submission: any) => {
        const scores = submission.shortVideoScores
        const judgesCount = scores.length

        if (judgesCount === 0) return null

        const avgKonten = scores.reduce((sum: number, s: any) => sum + s.kontenOriginalitas, 0) / judgesCount
        const avgKualitas = scores.reduce((sum: number, s: any) => sum + s.kualitasProduksi, 0) / judgesCount
        const avgNarasi = scores.reduce((sum: number, s: any) => sum + s.narasiPenceritaan, 0) / judgesCount
        const avgImpact = scores.reduce((sum: number, s: any) => sum + s.dampakPesan, 0) / judgesCount
        const totalScore = avgKonten + avgKualitas + avgNarasi + avgImpact

        const teamMembers = submission.registration.teamMembers?.map((m: any) => m.name).join(', ') || submission.registration.participant.fullName

        return {
          competitionType: 'DCC_SHORT_VIDEO',
          competitionName: 'DCC - Short Video',
          participantName: teamMembers,
          institution: submission.registration.participant.institution,
          title: submission.judulKarya,
          totalScore,
          judgesCount,
          category: 'DCC'
        }
      }).filter(Boolean).sort((a: any, b: any) => (b?.totalScore || 0) - (a?.totalScore || 0)).slice(0, 10)
    } catch (error) {
      console.error('Error fetching DCC Short Video winners:', error)
    }

    // Fetch KDBI Final Standings
    let kdbiWinners: any[] = []
    try {
      const kdbiStandings = await (prisma as any).teamStanding.findMany({
        where: {
          finalTeamPoints: {
            gt: 0
          },
          registration: {
            competition: {
              type: 'KDBI'
            }
          }
        },
        include: {
          registration: {
            include: {
              participant: {
                select: {
                  fullName: true,
                  institution: true
                }
              },
              teamMembers: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { finalTeamPoints: 'desc' },
          { finalSpeakerPoints: 'desc' },
          { finalAvgPosition: 'asc' }
        ],
        take: 10
      })

      kdbiWinners = kdbiStandings.map((standing: any) => {
        const teamMembers = standing.registration.teamMembers?.map((m: any) => m.name).join(', ') || standing.registration.participant.fullName

        return {
          competitionType: 'KDBI',
          competitionName: 'KDBI - Kompetisi Debat Bahasa Indonesia',
          participantName: teamMembers,
          institution: standing.registration.participant.institution,
          title: 'British Parliamentary Debate',
          totalScore: standing.finalTeamPoints + (standing.finalSpeakerPoints / 100),
          teamPoints: standing.finalTeamPoints,
          speakerPoints: standing.finalSpeakerPoints,
          matchesPlayed: standing.finalMatchesPlayed,
          category: 'DEBATE'
        }
      })
    } catch (error) {
      console.error('Error fetching KDBI winners:', error)
    }

    // Fetch EDC Final Standings
    let edcWinners: any[] = []
    try {
      const edcStandings = await (prisma as any).teamStanding.findMany({
        where: {
          finalTeamPoints: {
            gt: 0
          },
          registration: {
            competition: {
              type: 'EDC'
            }
          }
        },
        include: {
          registration: {
            include: {
              participant: {
                select: {
                  fullName: true,
                  institution: true
                }
              },
              teamMembers: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { finalTeamPoints: 'desc' },
          { finalSpeakerPoints: 'desc' },
          { finalAvgPosition: 'asc' }
        ],
        take: 10
      })

      edcWinners = edcStandings.map((standing: any) => {
        const teamMembers = standing.registration.teamMembers?.map((m: any) => m.name).join(', ') || standing.registration.participant.fullName

        return {
          competitionType: 'EDC',
          competitionName: 'EDC - English Debate Competition',
          participantName: teamMembers,
          institution: standing.registration.participant.institution,
          title: 'British Parliamentary Debate',
          totalScore: standing.finalTeamPoints + (standing.finalSpeakerPoints / 100),
          teamPoints: standing.finalTeamPoints,
          speakerPoints: standing.finalSpeakerPoints,
          matchesPlayed: standing.finalMatchesPlayed,
          category: 'DEBATE'
        }
      })
    } catch (error) {
      console.error('Error fetching EDC winners:', error)
    }

    // Combine all winners
    const allWinners = [
      ...spcWinners,
      ...dccInfografisWinners,
      ...dccShortVideoWinners,
      ...kdbiWinners,
      ...edcWinners
    ]

    return NextResponse.json({
      success: true,
      data: {
        allWinners,
        byCompetition: {
          SPC: spcWinners,
          DCC_INFOGRAFIS: dccInfografisWinners,
          DCC_SHORT_VIDEO: dccShortVideoWinners,
          KDBI: kdbiWinners,
          EDC: edcWinners
        },
        statistics: {
          totalCompetitions: 5,
          totalWinners: allWinners.length
        }
      },
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching finals leaderboard:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch finals leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
