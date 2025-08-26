import { RateLimiter } from 'limiter'
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
  skipSuccessfulRequests?: boolean
}

class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  get(key: string): { count: number; resetTime: number } | undefined {
    return this.store.get(key)
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new InMemoryStore()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  store.cleanup()
}, 5 * 60 * 1000)

function getClientIp(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown'
}

export function rateLimit(config: RateLimitConfig) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const clientIp = getClientIp(request)
      const key = `${clientIp}-${request.nextUrl.pathname}`
      const now = Date.now()
      const windowMs = config.windowMs
      const maxRequests = config.maxRequests
      
      let record = store.get(key)
      
      if (!record || now > record.resetTime) {
        // New window or expired record
        record = {
          count: 1,
          resetTime: now + windowMs
        }
        store.set(key, record)
      } else {
        // Within existing window
        record.count++
        store.set(key, record)
        
        if (record.count > maxRequests) {
          const resetTimeSeconds = Math.ceil((record.resetTime - now) / 1000)
          
          return NextResponse.json(
            { 
              error: config.message || 'Muitas tentativas. Tente novamente mais tarde.',
              retryAfter: resetTimeSeconds 
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': record.resetTime.toString(),
                'Retry-After': resetTimeSeconds.toString()
              }
            }
          )
        }
      }
      
      // Execute the handler
      const response = await handler(request, ...args)
      
      // Add rate limit headers to successful responses
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
        response.headers.set('X-RateLimit-Reset', record.resetTime.toString())
      }
      
      return response
    }
  }
}

// Predefined rate limiters for common use cases
export const authRateLimit = rateLimit({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
})

export const generalApiRateLimit = rateLimit({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // 1 minute
  message: 'Muitas requisições. Tente novamente em um minuto.'
})

export const strictRateLimit = rateLimit({
  maxRequests: 3, // 3 attempts
  windowMs: 60 * 1000, // 1 minute
  message: 'Limite de requisições excedido. Tente novamente em 1 minuto.'
})