import { NextRequest, NextResponse } from 'next/server'
import { getQueueStats } from '@/lib/queue-system'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/auth'
import { log } from '@/lib/logger'

async function handleGET(request: NextRequest, user: any) {
  try {
    log.apiRequest(request, 'GET /api/admin/jobs')

    const stats = await getQueueStats()
    
    if (!stats) {
      return ApiResponse.internalServerError('Erro ao obter estatísticas das filas')
    }

    log.info('Job queue stats retrieved by admin', { 
      adminUserId: user.userId,
      stats 
    })

    return ApiResponse.success(stats, {
      message: 'Estatísticas das filas de jobs',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    log.error('Error fetching job queue stats', error)
    return ApiResponse.internalServerError('Erro ao buscar estatísticas das filas')
  }
}

export const GET = withAuth(handleGET)