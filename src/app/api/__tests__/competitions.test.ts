/**
 * Tests for /api/competitions endpoint
 */

import { GET } from '../competitions/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    competition: {
      findMany: jest.fn(),
    },
  },
}))

describe('GET /api/competitions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return list of active competitions', async () => {
    const mockCompetitions = [
      {
        id: '1',
        name: 'Kompetisi Debat Bahasa Indonesia',
        shortName: 'KDBI',
        type: 'KDBI',
        category: 'debate',
        maxTeamSize: 2,
        minTeamSize: 2,
        earlyBirdPrice: 150000,
        phase1Price: 250000,
        phase2Price: 300000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-08'),
        phase1Start: new Date('2025-09-09'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-10-12'),
        workUploadDeadline: null,
        competitionDate: new Date('2025-10-15'),
        isActive: true,
      },
    ]

    ;(prisma.competition.findMany as jest.Mock).mockResolvedValue(mockCompetitions)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('id', 'kdbi')
    expect(data[0]).toHaveProperty('name', 'Kompetisi Debat Bahasa Indonesia')
    expect(data[0]).toHaveProperty('pricing')
    expect(data[0].pricing).toEqual({
      earlyBird: 150000,
      phase1: 250000,
      phase2: 300000,
    })
  })

  it('should filter only active competitions', async () => {
    ;(prisma.competition.findMany as jest.Mock).mockResolvedValue([])

    await GET()

    expect(prisma.competition.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  })

  it('should handle database errors gracefully', async () => {
    ;(prisma.competition.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error', 'Failed to fetch competitions')
  })

  it('should transform competition types correctly', async () => {
    const mockCompetitions = [
      {
        id: '1',
        name: 'English Debate Competition',
        shortName: 'EDC',
        type: 'EDC',
        category: 'debate',
        maxTeamSize: 2,
        minTeamSize: 2,
        earlyBirdPrice: 150000,
        phase1Price: 250000,
        phase2Price: 300000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-08'),
        phase1Start: new Date('2025-09-09'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-10-12'),
        workUploadDeadline: null,
        competitionDate: new Date('2025-10-15'),
        isActive: true,
      },
      {
        id: '2',
        name: 'Scientific Paper Competition',
        shortName: 'SPC',
        type: 'SPC',
        category: 'academic',
        maxTeamSize: 1,
        minTeamSize: 1,
        earlyBirdPrice: 50000,
        phase1Price: 65000,
        phase2Price: 75000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-08'),
        phase1Start: new Date('2025-09-09'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-10-12'),
        workUploadDeadline: new Date('2025-10-12'),
        competitionDate: new Date('2025-10-19'),
        isActive: true,
      },
    ]

    ;(prisma.competition.findMany as jest.Mock).mockResolvedValue(mockCompetitions)

    const response = await GET()
    const data = await response.json()

    expect(data).toHaveLength(2)
    expect(data[0].id).toBe('edc')
    expect(data[1].id).toBe('spc')
    expect(data[1].teamSize).toBe('Individual')
  })

  it('should calculate team size text correctly', async () => {
    const mockCompetitions = [
      {
        id: '1',
        name: 'DCC Infografis',
        shortName: 'DCC',
        type: 'DCC_INFOGRAFIS',
        category: 'creative',
        maxTeamSize: 3,
        minTeamSize: 1,
        earlyBirdPrice: 50000,
        phase1Price: 65000,
        phase2Price: 75000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-08'),
        phase1Start: new Date('2025-09-09'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-10-12'),
        workUploadDeadline: new Date('2025-10-12'),
        competitionDate: new Date('2025-10-19'),
        isActive: true,
      },
    ]

    ;(prisma.competition.findMany as jest.Mock).mockResolvedValue(mockCompetitions)

    const response = await GET()
    const data = await response.json()

    expect(data[0].teamSize).toBe('Max 3 people')
  })

  it('should include current phase and price', async () => {
    const mockCompetitions = [
      {
        id: '1',
        name: 'Test Competition',
        shortName: 'TC',
        type: 'KDBI',
        category: 'debate',
        maxTeamSize: 2,
        minTeamSize: 2,
        earlyBirdPrice: 100000,
        phase1Price: 150000,
        phase2Price: 200000,
        earlyBirdStart: new Date('2025-09-01'),
        earlyBirdEnd: new Date('2025-09-08'),
        phase1Start: new Date('2025-09-09'),
        phase1End: new Date('2025-09-19'),
        phase2Start: new Date('2025-09-20'),
        phase2End: new Date('2025-10-12'),
        workUploadDeadline: null,
        competitionDate: new Date('2025-10-15'),
        isActive: true,
      },
    ]

    ;(prisma.competition.findMany as jest.Mock).mockResolvedValue(mockCompetitions)

    const response = await GET()
    const data = await response.json()

    expect(data[0]).toHaveProperty('currentPhase')
    expect(data[0]).toHaveProperty('currentPrice')
    expect(['EARLY_BIRD', 'PHASE_1', 'PHASE_2']).toContain(data[0].currentPhase)
  })
})

