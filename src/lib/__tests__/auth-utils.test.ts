import { hasRole, requireRole, getDashboardPath, UserRole } from '../auth-utils'

describe('Auth Utils', () => {
  describe('hasRole', () => {
    it('should return true when user has required role', () => {
      expect(hasRole('admin', 'admin')).toBe(true)
      expect(hasRole('judge', 'judge')).toBe(true)
      expect(hasRole('participant', 'participant')).toBe(true)
    })

    it('should return false when user does not have required role', () => {
      expect(hasRole('participant', 'admin')).toBe(false)
      expect(hasRole('admin', 'judge')).toBe(false)
      expect(hasRole('judge', 'participant')).toBe(false)
    })

    it('should be case sensitive', () => {
      expect(hasRole('Admin', 'admin')).toBe(false)
      expect(hasRole('ADMIN', 'admin')).toBe(false)
      expect(hasRole('admin', 'admin')).toBe(true)
    })

    it('should handle empty strings', () => {
      expect(hasRole('', 'admin')).toBe(false)
      expect(hasRole('admin', '' as UserRole)).toBe(false)
    })

    it('should handle invalid roles', () => {
      expect(hasRole('invalid', 'admin')).toBe(false)
      expect(hasRole('user', 'admin')).toBe(false)
    })

    it('should return false for null-like values', () => {
      expect(hasRole(null as any, 'admin')).toBe(false)
      expect(hasRole(undefined as any, 'admin')).toBe(false)
    })
  })

  describe('requireRole', () => {
    it('should not throw when user has required role', () => {
      expect(() => requireRole('admin', 'admin')).not.toThrow()
      expect(() => requireRole('judge', 'judge')).not.toThrow()
      expect(() => requireRole('participant', 'participant')).not.toThrow()
    })

    it('should throw when user does not have required role', () => {
      expect(() => requireRole('participant', 'admin')).toThrow('Access denied. Required role: admin')
      expect(() => requireRole('admin', 'judge')).toThrow('Access denied. Required role: judge')
      expect(() => requireRole('judge', 'participant')).toThrow('Access denied. Required role: participant')
    })

    it('should throw with correct error message', () => {
      expect(() => requireRole('user', 'admin')).toThrow('Access denied. Required role: admin')
      expect(() => requireRole('guest', 'judge')).toThrow('Access denied. Required role: judge')
    })

    it('should throw for empty user role', () => {
      expect(() => requireRole('', 'admin')).toThrow('Access denied. Required role: admin')
    })

    it('should throw for invalid user role', () => {
      expect(() => requireRole('invalid', 'admin')).toThrow('Access denied. Required role: admin')
    })

    it('should throw for null user role', () => {
      expect(() => requireRole(null as any, 'admin')).toThrow('Access denied. Required role: admin')
    })

    it('should throw for undefined user role', () => {
      expect(() => requireRole(undefined as any, 'admin')).toThrow('Access denied. Required role: admin')
    })

    it('should be case sensitive', () => {
      expect(() => requireRole('Admin', 'admin')).toThrow('Access denied. Required role: admin')
      expect(() => requireRole('ADMIN', 'admin')).toThrow('Access denied. Required role: admin')
    })
  })

  describe('getDashboardPath', () => {
    it('should return correct path for admin role', () => {
      expect(getDashboardPath('admin')).toBe('/dashboard/admin')
    })

    it('should return correct path for judge role', () => {
      expect(getDashboardPath('judge')).toBe('/dashboard/judge')
    })

    it('should return correct path for participant role', () => {
      expect(getDashboardPath('participant')).toBe('/dashboard/participant')
    })

    it('should return default path for unknown role', () => {
      expect(getDashboardPath('unknown')).toBe('/dashboard')
      expect(getDashboardPath('user')).toBe('/dashboard')
      expect(getDashboardPath('guest')).toBe('/dashboard')
    })

    it('should return default path for empty string', () => {
      expect(getDashboardPath('')).toBe('/dashboard')
    })

    it('should return default path for null', () => {
      expect(getDashboardPath(null as any)).toBe('/dashboard')
    })

    it('should return default path for undefined', () => {
      expect(getDashboardPath(undefined as any)).toBe('/dashboard')
    })

    it('should be case sensitive', () => {
      expect(getDashboardPath('Admin')).toBe('/dashboard')
      expect(getDashboardPath('ADMIN')).toBe('/dashboard')
      expect(getDashboardPath('admin')).toBe('/dashboard/admin')
    })

    it('should handle all valid roles', () => {
      const roles = ['admin', 'judge', 'participant']
      const paths = roles.map(role => getDashboardPath(role))
      
      expect(paths).toEqual([
        '/dashboard/admin',
        '/dashboard/judge',
        '/dashboard/participant'
      ])
    })

    it('should return paths starting with /dashboard', () => {
      expect(getDashboardPath('admin')).toMatch(/^\/dashboard/)
      expect(getDashboardPath('judge')).toMatch(/^\/dashboard/)
      expect(getDashboardPath('participant')).toMatch(/^\/dashboard/)
      expect(getDashboardPath('unknown')).toMatch(/^\/dashboard/)
    })
  })

  describe('UserRole Type', () => {
    it('should accept valid role types', () => {
      const adminRole: UserRole = 'admin'
      const judgeRole: UserRole = 'judge'
      const participantRole: UserRole = 'participant'
      
      expect(adminRole).toBe('admin')
      expect(judgeRole).toBe('judge')
      expect(participantRole).toBe('participant')
    })
  })

  describe('Integration Tests', () => {
    it('should work together for admin workflow', () => {
      const userRole = 'admin'
      
      expect(hasRole(userRole, 'admin')).toBe(true)
      expect(() => requireRole(userRole, 'admin')).not.toThrow()
      expect(getDashboardPath(userRole)).toBe('/dashboard/admin')
    })

    it('should work together for judge workflow', () => {
      const userRole = 'judge'
      
      expect(hasRole(userRole, 'judge')).toBe(true)
      expect(() => requireRole(userRole, 'judge')).not.toThrow()
      expect(getDashboardPath(userRole)).toBe('/dashboard/judge')
    })

    it('should work together for participant workflow', () => {
      const userRole = 'participant'
      
      expect(hasRole(userRole, 'participant')).toBe(true)
      expect(() => requireRole(userRole, 'participant')).not.toThrow()
      expect(getDashboardPath(userRole)).toBe('/dashboard/participant')
    })

    it('should handle unauthorized access attempt', () => {
      const userRole = 'participant'
      
      expect(hasRole(userRole, 'admin')).toBe(false)
      expect(() => requireRole(userRole, 'admin')).toThrow()
      expect(getDashboardPath(userRole)).toBe('/dashboard/participant')
    })

    it('should handle invalid role gracefully', () => {
      const userRole = 'invalid'
      
      expect(hasRole(userRole, 'admin')).toBe(false)
      expect(() => requireRole(userRole, 'admin')).toThrow()
      expect(getDashboardPath(userRole)).toBe('/dashboard')
    })
  })
})

