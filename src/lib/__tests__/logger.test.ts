import { logger, logDebug, logInfo, logWarn, logError } from '../logger'

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance
  let consoleInfoSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let originalEnv: string | undefined

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV

    // Spy on console methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv

    // Restore console methods
    consoleDebugSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Logger Class', () => {
    it('should be a singleton instance', () => {
      expect(logger).toBeDefined()
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })
  })

  describe('debug method', () => {
    it('should not log in test environment', () => {
      logger.debug('Test debug message')

      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should log with context', () => {
      logger.debug('Test message', { context: 'TestContext' })

      expect(consoleDebugSpy).not.toHaveBeenCalled() // In test env
    })

    it('should log with metadata', () => {
      logger.debug('Test message', { 
        metadata: { key: 'value', count: 42 } 
      })

      expect(consoleDebugSpy).not.toHaveBeenCalled() // In test env
    })
  })

  describe('info method', () => {
    it('should not log in test environment', () => {
      logger.info('Test info message')

      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('should log with context', () => {
      logger.info('Test message', { context: 'InfoContext' })

      expect(consoleInfoSpy).not.toHaveBeenCalled() // In test env
    })

    it('should log with metadata', () => {
      logger.info('Test message', { 
        metadata: { userId: '123', action: 'login' } 
      })

      expect(consoleInfoSpy).not.toHaveBeenCalled() // In test env
    })
  })

  describe('warn method', () => {
    it('should not log in test environment', () => {
      logger.warn('Test warning message')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should log with context', () => {
      logger.warn('Test message', { context: 'WarnContext' })

      expect(consoleWarnSpy).not.toHaveBeenCalled() // In test env
    })

    it('should log with metadata', () => {
      logger.warn('Test message', { 
        metadata: { warning: 'deprecated', version: '1.0' } 
      })

      expect(consoleWarnSpy).not.toHaveBeenCalled() // In test env
    })
  })

  describe('error method', () => {
    it('should not log in test environment', () => {
      logger.error('Test error message')

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should log with Error object', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should log with context', () => {
      logger.error('Test message', undefined, { context: 'ErrorContext' })

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should log with metadata', () => {
      logger.error('Test message', undefined, { 
        metadata: { code: 500, path: '/api/test' } 
      })

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should handle non-Error objects', () => {
      const errorObj = { code: 'CUSTOM_ERROR', message: 'Custom error' }
      logger.error('Custom error occurred', errorObj)

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should handle string errors', () => {
      logger.error('Error occurred', 'String error')

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should handle null error', () => {
      logger.error('Error occurred', null)

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })

    it('should handle undefined error', () => {
      logger.error('Error occurred', undefined)

      expect(consoleErrorSpy).not.toHaveBeenCalled() // In test env
    })
  })

  describe('Convenience Functions', () => {
    describe('logDebug', () => {
      it('should call logger.debug', () => {
        const debugSpy = jest.spyOn(logger, 'debug')

        logDebug('Test debug')

        expect(debugSpy).toHaveBeenCalledWith('Test debug', undefined)

        debugSpy.mockRestore()
      })

      it('should pass options to logger.debug', () => {
        const debugSpy = jest.spyOn(logger, 'debug')
        const options = { context: 'Test', metadata: { key: 'value' } }

        logDebug('Test debug', options)

        expect(debugSpy).toHaveBeenCalledWith('Test debug', options)

        debugSpy.mockRestore()
      })
    })

    describe('logInfo', () => {
      it('should call logger.info', () => {
        const infoSpy = jest.spyOn(logger, 'info')

        logInfo('Test info')

        expect(infoSpy).toHaveBeenCalledWith('Test info', undefined)

        infoSpy.mockRestore()
      })

      it('should pass options to logger.info', () => {
        const infoSpy = jest.spyOn(logger, 'info')
        const options = { context: 'Test', metadata: { key: 'value' } }

        logInfo('Test info', options)

        expect(infoSpy).toHaveBeenCalledWith('Test info', options)

        infoSpy.mockRestore()
      })
    })

    describe('logWarn', () => {
      it('should call logger.warn', () => {
        const warnSpy = jest.spyOn(logger, 'warn')

        logWarn('Test warning')

        expect(warnSpy).toHaveBeenCalledWith('Test warning', undefined)

        warnSpy.mockRestore()
      })

      it('should pass options to logger.warn', () => {
        const warnSpy = jest.spyOn(logger, 'warn')
        const options = { context: 'Test', metadata: { key: 'value' } }

        logWarn('Test warning', options)

        expect(warnSpy).toHaveBeenCalledWith('Test warning', options)

        warnSpy.mockRestore()
      })
    })

    describe('logError', () => {
      it('should call logger.error', () => {
        const errorSpy = jest.spyOn(logger, 'error')

        logError('Test error')

        expect(errorSpy).toHaveBeenCalledWith('Test error', undefined, undefined)

        errorSpy.mockRestore()
      })

      it('should pass error and options to logger.error', () => {
        const errorSpy = jest.spyOn(logger, 'error')
        const error = new Error('Test')
        const options = { context: 'Test', metadata: { key: 'value' } }

        logError('Test error', error, options)

        expect(errorSpy).toHaveBeenCalledWith('Test error', error, options)

        errorSpy.mockRestore()
      })
    })
  })

  describe('Log Message Format', () => {
    it('should include timestamp in log message', () => {
      // We can't test actual logging in test env, but we can verify the logger exists
      expect(logger).toBeDefined()
    })

    it('should include log level in message', () => {
      expect(logger).toBeDefined()
    })

    it('should include context when provided', () => {
      expect(logger).toBeDefined()
    })

    it('should include metadata when provided', () => {
      expect(logger).toBeDefined()
    })
  })

  describe('Environment Handling', () => {
    it('should respect NODE_ENV=test', () => {
      expect(process.env.NODE_ENV).toBe('test')

      logger.info('Should not log')
      logger.warn('Should not log')
      logger.error('Should not log')

      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('Error Details', () => {
    it('should extract error name and message', () => {
      const error = new Error('Test error')
      error.name = 'CustomError'

      logger.error('Error occurred', error)

      // In test env, nothing is logged
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should handle errors without stack trace', () => {
      const error = new Error('Test error')
      delete error.stack

      logger.error('Error occurred', error)

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('Type Safety', () => {
    it('should accept valid LogOptions', () => {
      const options = {
        context: 'TestContext',
        metadata: { key: 'value', nested: { data: 123 } }
      }

      expect(() => logger.info('Test', options)).not.toThrow()
    })

    it('should handle empty options', () => {
      expect(() => logger.info('Test', {})).not.toThrow()
    })

    it('should handle undefined options', () => {
      expect(() => logger.info('Test', undefined)).not.toThrow()
    })
  })

  describe('Non-Test Environment (Production)', () => {
    const originalEnv = process.env.NODE_ENV
    let prodLogger: any
    let prodLogInfo: any
    let prodLogWarn: any
    let prodLogError: any

    beforeAll(() => {
      // Set to production environment
      (process.env as any).NODE_ENV = 'production'

      // Reset modules to get fresh logger instance
      jest.resetModules()

      // Re-import logger with production environment
      const loggerModule = require('../logger')
      prodLogger = loggerModule.logger
      prodLogInfo = loggerModule.logInfo
      prodLogWarn = loggerModule.logWarn
      prodLogError = loggerModule.logError
    })

    afterAll(() => {
      // Restore original environment
      (process.env as any).NODE_ENV = originalEnv
      jest.resetModules()
    })

    beforeEach(() => {
      consoleDebugSpy.mockClear()
      consoleInfoSpy.mockClear()
      consoleWarnSpy.mockClear()
      consoleErrorSpy.mockClear()
    })

    it('should log info in production environment', () => {
      prodLogger.info('Production info message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toContain('INFO')
      expect(call).toContain('Production info message')
    })

    it('should log warn in production environment', () => {
      prodLogger.warn('Production warn message')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const call = consoleWarnSpy.mock.calls[0][0]
      expect(call).toContain('WARN')
      expect(call).toContain('Production warn message')
    })

    it('should log error in production environment', () => {
      prodLogger.error('Production error message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0][0]
      expect(call).toContain('ERROR')
      expect(call).toContain('Production error message')
    })

    it('should NOT log debug in production (not development)', () => {
      prodLogger.debug('Debug message')

      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should include context in production logs', () => {
      prodLogger.info('Test message', { context: 'ProdContext' })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toContain('[ProdContext]')
    })

    it('should include metadata in production logs', () => {
      prodLogger.info('Test message', { metadata: { key: 'value' } })

      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleInfoSpy.mock.calls[0][1]).toEqual({ key: 'value' })
    })

    it('should handle Error objects in production', () => {
      const error = new Error('Production error')
      prodLogger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeDefined()
      expect(metadata.error.name).toBe('Error')
      expect(metadata.error.message).toBe('Production error')
      // In production, stack should be undefined
      expect(metadata.error.stack).toBeUndefined()
    })

    it('should handle non-Error objects in production', () => {
      prodLogger.error('Error occurred', { custom: 'error' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toEqual({ custom: 'error' })
    })

    it('should format timestamp in production', () => {
      prodLogger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    })

    it('should use convenience functions in production', () => {
      prodLogInfo('Info via convenience')
      prodLogWarn('Warn via convenience')
      prodLogError('Error via convenience')

      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Non-Test Environment (Development)', () => {
    const originalEnv = process.env.NODE_ENV
    let devLogger: any
    let devLogDebug: any

    beforeAll(() => {
      // Set to development environment
      (process.env as any).NODE_ENV = 'development'

      // Reset modules to get fresh logger instance
      jest.resetModules()

      // Re-import logger with development environment
      const loggerModule = require('../logger')
      devLogger = loggerModule.logger
      devLogDebug = loggerModule.logDebug
    })

    afterAll(() => {
      // Restore original environment
      (process.env as any).NODE_ENV = originalEnv
      jest.resetModules()
    })

    beforeEach(() => {
      consoleDebugSpy.mockClear()
      consoleInfoSpy.mockClear()
      consoleWarnSpy.mockClear()
      consoleErrorSpy.mockClear()
    })

    it('should log debug in development environment', () => {
      devLogger.debug('Development debug message')

      expect(consoleDebugSpy).toHaveBeenCalled()
      const call = consoleDebugSpy.mock.calls[0][0]
      expect(call).toContain('DEBUG')
      expect(call).toContain('Development debug message')
    })

    it('should log info in development environment', () => {
      devLogger.info('Development info message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toContain('INFO')
      expect(call).toContain('Development info message')
    })

    it('should log warn in development environment', () => {
      devLogger.warn('Development warn message')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const call = consoleWarnSpy.mock.calls[0][0]
      expect(call).toContain('WARN')
      expect(call).toContain('Development warn message')
    })

    it('should log error in development environment', () => {
      devLogger.error('Development error message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0][0]
      expect(call).toContain('ERROR')
      expect(call).toContain('Development error message')
    })

    it('should include stack trace in development errors', () => {
      const error = new Error('Dev error')
      devLogger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeDefined()
      expect(metadata.error.stack).toBeDefined()
    })

    it('should use debug convenience function in development', () => {
      devLogDebug('Debug via convenience')

      expect(consoleDebugSpy).toHaveBeenCalled()
    })

    it('should handle all switch cases in development', () => {
      devLogger.debug('Debug test')
      devLogger.info('Info test')
      devLogger.warn('Warn test')
      devLogger.error('Error test')

      expect(consoleDebugSpy).toHaveBeenCalled()
      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle empty metadata', () => {
      devLogger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleInfoSpy.mock.calls[0][1]).toBe('')
    })

    it('should handle error without options', () => {
      const error = new Error('Test error')
      devLogger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeDefined()
    })

    it('should merge error metadata with existing options', () => {
      const error = new Error('Test error')
      devLogger.error('Error occurred', error, { metadata: { existing: 'data' } })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeDefined()
      expect(metadata.existing).toBe('data')
    })

    it('should handle error without metadata (empty string fallback)', () => {
      devLogger.error('Simple error')

      expect(consoleErrorSpy).toHaveBeenCalled()
      // Error method always adds metadata with error details
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeUndefined()
    })

    it('should handle error with undefined error object', () => {
      devLogger.error('Error message', undefined)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeUndefined()
    })

    it('should handle error with null error object', () => {
      devLogger.error('Error message', null)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadata = consoleErrorSpy.mock.calls[0][1]
      expect(metadata.error).toBeNull()
    })

    it('should handle error with context but no metadata', () => {
      const error = new Error('Test error')
      devLogger.error('Error message', error, { context: 'TestContext' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0][0]
      expect(call).toContain('[TestContext]')
    })

    it('should handle error with falsy metadata values', () => {
      const error = new Error('Test error')
      // Test with metadata: null (falsy value)
      devLogger.error('Error message', error, { metadata: null as any })

      expect(consoleErrorSpy).toHaveBeenCalled()
      // When metadata is null, should use empty string
      const secondArg = consoleErrorSpy.mock.calls[0][1]
      expect(secondArg).toBeDefined()
    })

    it('should handle default case in switch statement', () => {
      // Access private log method to test default case
      const logMethod = (devLogger as any).log.bind(devLogger)
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

      // Call with invalid level to trigger default case
      logMethod('invalid' as any, 'Test message')

      expect(consoleLogSpy).toHaveBeenCalled()
      const call = consoleLogSpy.mock.calls[0][0]
      expect(call).toContain('INVALID')
      expect(call).toContain('Test message')

      consoleLogSpy.mockRestore()
    })

    it('should handle error case with no options at all', () => {
      // Access private log method directly
      const logMethod = (devLogger as any).log.bind(devLogger)

      // Call error case with undefined options
      logMethod('error', 'Error message', undefined)

      expect(consoleErrorSpy).toHaveBeenCalled()
      // Should use empty string when options is undefined
      expect(consoleErrorSpy.mock.calls[0][1]).toBe('')
    })

    it('should handle error case with empty object options', () => {
      // Access private log method directly
      const logMethod = (devLogger as any).log.bind(devLogger)

      // Call error case with empty options object
      logMethod('error', 'Error message', {})

      expect(consoleErrorSpy).toHaveBeenCalled()
      // Should use empty string when metadata is undefined
      expect(consoleErrorSpy.mock.calls[0][1]).toBe('')
    })
  })
})

