import { NextResponse } from 'next/server'

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
    }
    [key: string]: any
  }
}

class ApiResponseBuilder {
  static success<T>(data: T, meta?: ApiResponse<T>['meta']): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta })
    })
  }

  static error(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    }, { status: statusCode })
  }

  static validationError(
    message: string = 'Dados inválidos',
    details?: any
  ): NextResponse<ApiResponse> {
    return this.error('VALIDATION_ERROR', message, 400, details)
  }

  static notFound(
    resource: string = 'Recurso',
    id?: string
  ): NextResponse<ApiResponse> {
    const message = id 
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`
    
    return this.error('NOT_FOUND', message, 404)
  }

  static unauthorized(
    message: string = 'Acesso não autorizado'
  ): NextResponse<ApiResponse> {
    return this.error('UNAUTHORIZED', message, 401)
  }

  static forbidden(
    message: string = 'Acesso negado'
  ): NextResponse<ApiResponse> {
    return this.error('FORBIDDEN', message, 403)
  }

  static conflict(
    message: string,
    details?: any
  ): NextResponse<ApiResponse> {
    return this.error('CONFLICT', message, 409, details)
  }

  static tooManyRequests(
    message: string = 'Muitas requisições',
    retryAfter?: number
  ): NextResponse<ApiResponse> {
    const response = this.error('TOO_MANY_REQUESTS', message, 429)
    
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }
    
    return response
  }

  static internalError(
    message: string = 'Erro interno do servidor',
    details?: any
  ): NextResponse<ApiResponse> {
    // Log the error details but don't expose them to client in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Internal Error Details:', details)
    }
    
    return this.error('INTERNAL_ERROR', message, 500, 
      process.env.NODE_ENV === 'development' ? details : undefined
    )
  }

  static databaseError(
    message: string = 'Erro de banco de dados'
  ): NextResponse<ApiResponse> {
    return this.error('DATABASE_ERROR', message, 500)
  }
}

export { ApiResponseBuilder as ApiResponseHandler }

// Common error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
} as const

// Type for error codes
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]