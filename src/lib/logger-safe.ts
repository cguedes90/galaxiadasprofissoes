// Safe logger that works in all environments (development and production)
// Falls back to console.log when pino/worker threads are not available

import { env } from './env'

// Detect if we can use the full logger
const canUseFullLogger = !env.isProduction && typeof Worker !== 'undefined'

let logger: any = null

try {
  if (canUseFullLogger) {
    // Try to import and use pino only in development
    const pino = require('pino')
    logger = pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'hostname,pid'
        }
      }
    })
  }
} catch (error) {
  // Fallback to console logging if pino fails
  console.warn('Falling back to console logging due to pino error:', error.message)
}

// Safe logging functions that always work
export const log = {
  debug: (message: string, data?: any) => {
    if (logger && canUseFullLogger) {
      logger.debug(data, message)
    } else {
      console.debug(message, data)
    }
  },
  
  info: (message: string, data?: any) => {
    if (logger && canUseFullLogger) {
      logger.info(data, message)
    } else {
      console.log(message, data)
    }
  },
  
  warn: (message: string, data?: any) => {
    if (logger && canUseFullLogger) {
      logger.warn(data, message)
    } else {
      console.warn(message, data)
    }
  },
  
  error: (message: string, error?: Error | any) => {
    if (logger && canUseFullLogger) {
      if (error instanceof Error) {
        logger.error({ err: error }, message)
      } else {
        logger.error({ error }, message)
      }
    } else {
      console.error(message, error)
    }
  },

  // API specific logging - simplified for production
  apiRequest: (req: any, message?: string) => {
    const logData = {
      method: req.method,
      url: req.url || req.nextUrl?.pathname,
      userAgent: req.headers?.get?.('user-agent') || req.headers?.['user-agent']
    }
    
    if (logger && canUseFullLogger) {
      logger.info(logData, message || 'API Request')
    } else {
      console.log(message || 'API Request', logData)
    }
  },

  // Authentication logging - safe for production
  authSuccess: (userId: string, email: string, method: string = 'login') => {
    const logData = {
      userId,
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
      method,
      event: 'auth_success'
    }
    
    if (logger && canUseFullLogger) {
      logger.info(logData, 'Authentication successful')
    } else {
      console.log('Authentication successful', logData)
    }
  },

  authFailure: (email: string, reason: string, method: string = 'login') => {
    const logData = {
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
      reason,
      method,
      event: 'auth_failure'
    }
    
    if (logger && canUseFullLogger) {
      logger.warn(logData, 'Authentication failed')
    } else {
      console.warn('Authentication failed', logData)
    }
  },

  // Database logging - simplified
  dbQuery: (query: string, params?: any[], duration?: number) => {
    const logData = {
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      paramCount: params?.length || 0,
      duration: duration ? `${duration}ms` : undefined,
      event: 'db_query'
    }
    
    if (logger && canUseFullLogger) {
      logger.debug(logData, 'Database query executed')
    } else if (duration && duration > 1000) {
      // Only log slow queries in production
      console.log('Slow database query', logData)
    }
  },

  dbError: (query: string, error: Error, params?: any[]) => {
    const logData = {
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      paramCount: params?.length || 0,
      error: error.message,
      event: 'db_error'
    }
    
    if (logger && canUseFullLogger) {
      logger.error({ err: error, ...logData }, 'Database query failed')
    } else {
      console.error('Database query failed', logData)
    }
  }
}

export default log