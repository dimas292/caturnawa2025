/**
 * Logging utility for production-safe logging
 * Only logs in development mode or when explicitly enabled
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  context?: string
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment && !this.isTest) {
      this.log('debug', message, options)
    }
  }

  /**
   * Log info messages
   */
  info(message: string, options?: LogOptions): void {
    if (!this.isTest) {
      this.log('info', message, options)
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, options?: LogOptions): void {
    if (!this.isTest) {
      this.log('warn', message, options)
    }
  }

  /**
   * Log error messages (always logged except in tests)
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
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

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
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

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logDebug = (message: string, options?: LogOptions) => logger.debug(message, options)
export const logInfo = (message: string, options?: LogOptions) => logger.info(message, options)
export const logWarn = (message: string, options?: LogOptions) => logger.warn(message, options)
export const logError = (message: string, error?: Error | unknown, options?: LogOptions) => 
  logger.error(message, error, options)

