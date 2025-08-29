import { NextRequest, NextResponse } from 'next/server'
import { getCachedStats } from '@/lib/cache-strategy'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import { generalApiRateLimit } from '@/lib/rate-limiter'
import { log } from '@/lib/logger'

async function handleGET(request: NextRequest) {
  try {
    log.apiRequest(request, 'GET /api/stats')

    const stats = await getCachedStats()

    log.info('App stats retrieved', { 
      totalProfessions: stats.totalProfessions,
      totalUsers: stats.totalUsers,
      cached: true
    })

    return ApiResponse.success(stats, {
      message: 'Estatísticas da aplicação',
      cached: true
    })
  } catch (error) {
    log.error('Error fetching app stats', error)
    return ApiResponse.internalServerError('Erro ao buscar estatísticas')
  }
}

export const GET = generalApiRateLimit(handleGET)