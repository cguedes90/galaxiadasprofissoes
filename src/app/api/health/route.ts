import { NextRequest, NextResponse } from 'next/server'
import { healthCheck, getPoolStats } from '@/lib/database'
import { redis } from '@/lib/redis'
import { getCacheHealth } from '@/lib/cache-strategy'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test database connection
    const dbStart = Date.now()
    const dbHealthy = await healthCheck()
    const dbResponseTime = Date.now() - dbStart
    
    // Test Redis connection and get cache health
    const redisStart = Date.now()
    const cacheHealth = await getCacheHealth()
    const redisResponseTime = Date.now() - redisStart
    
    // Get database pool stats
    const poolStats = getPoolStats()
    
    // Determine overall status
    let status = 'healthy'
    if (!dbHealthy) {
      status = 'unhealthy'
    } else if (!cacheHealth.connected) {
      status = 'degraded'
    }
    
    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: dbResponseTime,
          poolStats,
        },
        cache: {
          status: cacheHealth.connected ? 'healthy' : 'unhealthy',
          responseTime: redisResponseTime,
          keyCount: cacheHealth.keyCount || 0,
          connected: cacheHealth.connected,
          ...(cacheHealth.error && { error: cacheHealth.error })
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }
    
    return NextResponse.json(healthData, { 
      status: status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503 
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: 'Health check failed',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }, { status: 503 })
  }
}