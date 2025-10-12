import {
  competitions,
  getCompetitionById,
  getCompetitionByType,
  getCurrentPhaseForCompetition,
  getCurrentPrice,
  getPhaseLabel
} from '../competitions'

describe('Competitions Utility', () => {
  describe('competitions data', () => {
    it('should have 5 competitions', () => {
      expect(competitions).toHaveLength(5)
    })

    it('should have all required competition types', () => {
      const types = competitions.map(c => c.type)
      expect(types).toContain('KDBI')
      expect(types).toContain('EDC')
      expect(types).toContain('SPC')
      expect(types).toContain('DCC_INFOGRAFIS')
      expect(types).toContain('DCC_SHORT_VIDEO')
    })

    it('should have valid pricing for all competitions', () => {
      competitions.forEach(comp => {
        expect(comp.pricing.earlyBird).toBeGreaterThan(0)
        expect(comp.pricing.phase1).toBeGreaterThan(0)
        expect(comp.pricing.phase2).toBeGreaterThan(0)
        expect(comp.pricing.phase1).toBeGreaterThanOrEqual(comp.pricing.earlyBird)
        expect(comp.pricing.phase2).toBeGreaterThanOrEqual(comp.pricing.phase1)
      })
    })

    it('should have valid team size constraints', () => {
      competitions.forEach(comp => {
        expect(comp.minMembers).toBeGreaterThan(0)
        expect(comp.maxMembers).toBeGreaterThanOrEqual(comp.minMembers)
      })
    })
  })

  describe('getCompetitionById', () => {
    it('should return competition by id', () => {
      const kdbi = getCompetitionById('kdbi')
      expect(kdbi).toBeDefined()
      expect(kdbi?.shortName).toBe('KDBI')
    })

    it('should return undefined for invalid id', () => {
      const invalid = getCompetitionById('invalid-id')
      expect(invalid).toBeUndefined()
    })

    it('should find all competitions by their ids', () => {
      expect(getCompetitionById('kdbi')).toBeDefined()
      expect(getCompetitionById('edc')).toBeDefined()
      expect(getCompetitionById('spc')).toBeDefined()
      expect(getCompetitionById('dcc-infografis')).toBeDefined()
      expect(getCompetitionById('dcc-short-video')).toBeDefined()
    })
  })

  describe('getCompetitionByType', () => {
    it('should return competition by type', () => {
      const kdbi = getCompetitionByType('KDBI')
      expect(kdbi).toBeDefined()
      expect(kdbi?.id).toBe('kdbi')
    })

    it('should return undefined for invalid type', () => {
      const invalid = getCompetitionByType('INVALID_TYPE')
      expect(invalid).toBeUndefined()
    })

    it('should find all competitions by their types', () => {
      expect(getCompetitionByType('KDBI')).toBeDefined()
      expect(getCompetitionByType('EDC')).toBeDefined()
      expect(getCompetitionByType('SPC')).toBeDefined()
      expect(getCompetitionByType('DCC_INFOGRAFIS')).toBeDefined()
      expect(getCompetitionByType('DCC_SHORT_VIDEO')).toBeDefined()
    })
  })

  describe('getCurrentPhaseForCompetition', () => {
    const kdbi = competitions[0]

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return EARLY_BIRD for dates within early bird period', () => {
      // Set system time to early bird period
      jest.setSystemTime(new Date('2025-09-05'))

      const phase = getCurrentPhaseForCompetition(kdbi)
      expect(phase).toBe('EARLY_BIRD')
    })

    it('should return PHASE_1 for dates within phase 1 period', () => {
      // Set system time to phase 1 period
      jest.setSystemTime(new Date('2025-09-15'))

      const phase = getCurrentPhaseForCompetition(kdbi)
      expect(phase).toBe('PHASE_1')
    })

    it('should return PHASE_2 for dates within phase 2 period', () => {
      // Set system time to phase 2 period
      jest.setSystemTime(new Date('2025-09-25'))

      const phase = getCurrentPhaseForCompetition(kdbi)
      expect(phase).toBe('PHASE_2')
    })

    it('should return CLOSED for dates after phase 2 ends', () => {
      // Set system time to after phase 2 ends
      jest.setSystemTime(new Date('2025-10-15'))

      const phase = getCurrentPhaseForCompetition(kdbi)
      expect(phase).toBe('CLOSED')
    })
  })

  describe('getCurrentPrice', () => {
    const kdbi = competitions[0]

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return early bird price during early bird period', () => {
      jest.setSystemTime(new Date('2025-09-05'))

      const price = getCurrentPrice(kdbi)
      expect(price).toBe(kdbi.pricing.earlyBird)
    })

    it('should return phase 1 price during phase 1 period', () => {
      jest.setSystemTime(new Date('2025-09-15'))

      const price = getCurrentPrice(kdbi)
      expect(price).toBe(kdbi.pricing.phase1)
    })

    it('should return phase 2 price during phase 2 period', () => {
      jest.setSystemTime(new Date('2025-09-25'))

      const price = getCurrentPrice(kdbi)
      expect(price).toBe(kdbi.pricing.phase2)
    })

    it('should return 0 when competition is closed', () => {
      jest.setSystemTime(new Date('2025-10-15'))

      const price = getCurrentPrice(kdbi)
      expect(price).toBe(0)
    })
  })

  describe('getPhaseLabel', () => {
    const kdbi = competitions[0]

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return "Early Bird" during early bird period', () => {
      jest.setSystemTime(new Date('2025-09-05'))
      expect(getPhaseLabel(kdbi)).toBe('Early Bird')
    })

    it('should return "Phase 1" during phase 1 period', () => {
      jest.setSystemTime(new Date('2025-09-15'))
      expect(getPhaseLabel(kdbi)).toBe('Phase 1')
    })

    it('should return "Phase 2" during phase 2 period', () => {
      jest.setSystemTime(new Date('2025-09-25'))
      expect(getPhaseLabel(kdbi)).toBe('Phase 2')
    })

    it('should return "Closed" after competition ends', () => {
      jest.setSystemTime(new Date('2025-10-15'))
      expect(getPhaseLabel(kdbi)).toBe('Closed')
    })
  })

  describe('competition categories', () => {
    it('should categorize KDBI and EDC as debate', () => {
      const kdbi = getCompetitionById('kdbi')
      const edc = getCompetitionById('edc')
      expect(kdbi?.category).toBe('debate')
      expect(edc?.category).toBe('debate')
    })

    it('should categorize SPC as academic', () => {
      const spc = getCompetitionById('spc')
      expect(spc?.category).toBe('academic')
    })

    it('should categorize DCC competitions as creative', () => {
      const dccInfografis = getCompetitionById('dcc-infografis')
      const dccShortVideo = getCompetitionById('dcc-short-video')
      expect(dccInfografis?.category).toBe('creative')
      expect(dccShortVideo?.category).toBe('creative')
    })
  })

  describe('work upload deadlines', () => {
    it('should have work upload deadline for SPC', () => {
      const spc = getCompetitionById('spc')
      expect(spc?.workUploadDeadline).not.toBeNull()
    })

    it('should have work upload deadline for DCC competitions', () => {
      const dccInfografis = getCompetitionById('dcc-infografis')
      const dccShortVideo = getCompetitionById('dcc-short-video')
      expect(dccInfografis?.workUploadDeadline).not.toBeNull()
      expect(dccShortVideo?.workUploadDeadline).not.toBeNull()
    })

    it('should not have work upload deadline for debate competitions', () => {
      const kdbi = getCompetitionById('kdbi')
      const edc = getCompetitionById('edc')
      expect(kdbi?.workUploadDeadline).toBeNull()
      expect(edc?.workUploadDeadline).toBeNull()
    })
  })
})

