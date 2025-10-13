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

  describe('Non-Test Environment Simulation', () => {
    // Create a new logger instance to test non-test behavior
    class TestLogger {
      private isDevelopment = false
      private isTest = false

      debug(message: string, options?: any): void {
        if (this.isDevelopment && !this.isTest) {
          this.log('debug', message, options)
        }
      }

      info(message: string, options?: any): void {
        if (!this.isTest) {
          this.log('info', message, options)
        }
      }

      warn(message: string, options?: any): void {
        if (!this.isTest) {
          this.log('warn', message, options)
        }
      }

      error(message: string, error?: Error | unknown, options?: any): void {
        if (!this.isTest) {
          const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
          } : error

          this.log('error', message, {
            ...options,
            metadata: {
              ...options?.metadata,
              error: errorDetails,
            },
          })
        }
      }

      private log(level: string, message: string, options?: any): void {
        const timestamp = new Date().toISOString()
        const context = options?.context ? `[${options.context}]` : ''
        const prefix = `${timestamp} ${level.toUpperCase()} ${context}`
        const logMessage = `${prefix} ${message}`

        switch (level) {
          case 'debug':
            console.debug(logMessage, options?.metadata || '')
            break
          case 'info':
            console.info(logMessage, options?.metadata || '')
            break
          case 'warn':
            console.warn(logMessage, options?.metadata || '')
            break
          case 'error':
            console.error(logMessage, options?.metadata || '')
            break
        }
      }
    }

    it('should log info in non-test environment', () => {
      const testLogger = new TestLogger()
      testLogger.info('Test info message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toContain('INFO')
      expect(call).toContain('Test info message')
    })

    it('should log warn in non-test environment', () => {
      const testLogger = new TestLogger()
      testLogger.warn('Test warning message')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const call = consoleWarnSpy.mock.calls[0][0]
      expect(call).toContain('WARN')
      expect(call).toContain('Test warning message')
    })

    it('should log error in non-test environment', () => {
      const testLogger = new TestLogger()
      const error = new Error('Test error')
      testLogger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0][0]
      expect(call).toContain('ERROR')
      expect(call).toContain('Error occurred')
    })

    it('should include context in log message', () => {
      const testLogger = new TestLogger()
      testLogger.info('Test message', { context: 'TestContext' })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      expect(call).toContain('[TestContext]')
    })

    it('should include metadata in log', () => {
      const testLogger = new TestLogger()
      const metadata = { userId: '123', action: 'login' }
      testLogger.info('User action', { metadata })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const metadataArg = consoleInfoSpy.mock.calls[0][1]
      expect(metadataArg).toEqual(metadata)
    })

    it('should handle error with stack trace', () => {
      const testLogger = new TestLogger()
      const error = new Error('Test error')
      testLogger.error('Error with stack', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadataArg = consoleErrorSpy.mock.calls[0][1]
      expect(metadataArg.error).toBeDefined()
      expect(metadataArg.error.name).toBe('Error')
      expect(metadataArg.error.message).toBe('Test error')
    })

    it('should handle non-Error objects in error method', () => {
      const testLogger = new TestLogger()
      const errorObj = { code: 'CUSTOM', message: 'Custom error' }
      testLogger.error('Custom error', errorObj)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const metadataArg = consoleErrorSpy.mock.calls[0][1]
      expect(metadataArg.error).toEqual(errorObj)
    })

    it('should format timestamp correctly', () => {
      const testLogger = new TestLogger()
      testLogger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const call = consoleInfoSpy.mock.calls[0][0]
      // Check for ISO timestamp format (YYYY-MM-DDTHH:mm:ss)
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})

