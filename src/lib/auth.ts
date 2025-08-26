import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { env } from './env'

export interface AuthenticatedUser {
  userId: string
  email: string
  name: string
}

export class AuthenticationError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export function verifyToken(token: string): AuthenticatedUser {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    
    if (!decoded.userId || !decoded.email || !decoded.name) {
      throw new AuthenticationError('Token payload inválido')
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expirado', 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Token inválido', 401)
    }
    throw new AuthenticationError('Falha na autenticação', 401)
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check cookie as fallback
  const tokenCookie = request.cookies.get('authToken')
  if (tokenCookie) {
    return tokenCookie.value
  }
  
  return null
}

export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const token = extractTokenFromRequest(request)
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token de autenticação necessário' },
          { status: 401 }
        )
      }
      
      const user = verifyToken(token)
      return await handler(request, user, ...args)
      
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      
      console.error('Erro de autenticação:', error)
      return NextResponse.json(
        { error: 'Erro interno de autenticação' },
        { status: 500 }
      )
    }
  }
}

export function generateToken(payload: {
  userId: string
  email: string
  name: string
}, expiresIn: string = '7d'): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn })
}

export function createAuthResponse(user: any, token: string) {
  const response = NextResponse.json({
    success: true,
    user,
    token
  })
  
  // Set cookie for browser clients
  response.cookies.set('authToken', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
  
  return response
}