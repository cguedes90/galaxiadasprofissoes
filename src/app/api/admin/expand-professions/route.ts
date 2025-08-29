import { NextRequest, NextResponse } from 'next/server'
import { addNewProfessions } from '@/scripts/add-new-professions'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/auth'
import { log } from '@/lib/logger'
import { strictRateLimit } from '@/lib/rate-limiter'

async function handlePOST(request: NextRequest, user: any) {
  try {
    log.apiRequest(request, 'POST /api/admin/expand-professions')

    const result = await addNewProfessions()

    log.info('Professions expanded by admin', { 
      adminUserId: user.userId,
      result 
    })

    return ApiResponse.success(result, {
      message: `${result.addedCount} novas profissões adicionadas com sucesso!`
    })
  } catch (error) {
    log.error('Error expanding professions', error)
    return ApiResponse.internalError('Erro ao expandir profissões')
  }
}

export const POST = withAuth(strictRateLimit(handlePOST))