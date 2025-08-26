import pino from 'pino'
import { env } from './env'

// Configure logger based on environment
const logger = pino({
  level: env.isDevelopment ? 'debug' : 'info',
  
  // Development configuration
  ...(env.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid'
      }
    }
  }),

  // Production configuration
  ...(!env.isDevelopment && {
    formatters: {
      level: (label) => {
        return { level: label }
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime
  }),

  // Base configuration for all environments
  base: {
    pid: false,
    hostname: false
  },

  // Serializers for better log formatting
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err
  }
})

// Helper functions for structured logging
export const log = {
  // General logging
  debug: (message: string, data?: any) => logger.debug(data, message),
  info: (message: string, data?: any) => logger.info(data, message),
  warn: (message: string, data?: any) => logger.warn(data, message),
  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      logger.error({ err: error }, message)
    } else {
      logger.error({ error }, message)
    }
  },

  // API specific logging
  apiRequest: (req: any, message?: string) => {
    logger.info({
      method: req.method,
      url: req.url,
      userAgent: req.headers?.get?.('user-agent') || req.headers?.['user-agent'],
      ip: req.ip || req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for']
    }, message || 'API Request')
  },

  apiResponse: (req: any, res: any, duration?: number, message?: string) => {
    logger.info({
      method: req.method,
      url: req.url,
      status: res.status,
      duration: duration ? `${duration}ms` : undefined
    }, message || 'API Response')
  },

  // Authentication logging
  authSuccess: (userId: string, email: string, method: string = 'login') => {
    logger.info({
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
      method,
      event: 'auth_success'
    }, 'Authentication successful')
  },

  authFailure: (email: string, reason: string, method: string = 'login') => {
    logger.warn({
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
      reason,
      method,
      event: 'auth_failure'
    }, 'Authentication failed')
  },

  // Database logging
  dbQuery: (query: string, params?: any[], duration?: number) => {
    logger.debug({
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      paramCount: params?.length || 0,
      duration: duration ? `${duration}ms` : undefined,
      event: 'db_query'
    }, 'Database query executed')
  },

  dbError: (query: string, error: Error, params?: any[]) => {
    logger.error({
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      paramCount: params?.length || 0,
      err: error,
      event: 'db_error'
    }, 'Database query failed')
  },

  // Security logging
  rateLimitHit: (ip: string, endpoint: string, limit: number) => {
    logger.warn({
      ip,
      endpoint,
      limit,
      event: 'rate_limit_exceeded'
    }, 'Rate limit exceeded')
  },

  suspiciousActivity: (ip: string, reason: string, data?: any) => {
    logger.warn({
      ip,
      reason,
      data,
      event: 'suspicious_activity'
    }, 'Suspicious activity detected')
  },

  // Application events
  userRegistration: (userId: string, email: string) => {
    logger.info({
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      event: 'user_registration'
    }, 'New user registered')
  },

  professionViewed: (userId: string, professionId: number, professionName: string) => {
    logger.info({
      userId,
      professionId,
      professionName,
      event: 'profession_viewed'
    }, 'Profession viewed')
  },

  testCompleted: (userId: string, testType: string, score?: number) => {
    logger.info({
      userId,
      testType,
      score,
      event: 'test_completed'
    }, 'Vocational test completed')
  },

  // Email logging
  emailSent: (to: string, subject: string, success: boolean) => {
    logger.info({
      to: to.replace(/(.{2}).*(@.*)/, '$1***$2'),
      subject,
      success,
      event: 'email_sent'
    }, success ? 'Email sent successfully' : 'Email failed to send')
  }
}

// Export the raw logger for advanced use cases
export { logger }

// Middleware function to add request logging
export function withLogging<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  name?: string
) {
  return async (...args: T) => {
    const startTime = Date.now()
    const request = args[0] // Assume first argument is the request
    
    try {
      log.apiRequest(request, name ? `${name} - Request` : undefined)
      const result = await handler(...args)
      
      const duration = Date.now() - startTime
      log.apiResponse(request, result, duration, name ? `${name} - Success` : undefined)
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      log.error(
        name ? `${name} - Error` : 'Handler error',
        { error, duration: `${duration}ms`, url: request.url, method: request.method }
      )
      throw error
    }
  }
}

export default log