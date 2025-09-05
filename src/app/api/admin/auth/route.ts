import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key-change-in-production'

// POST - Login do admin
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return ApiResponse.validationError('Username e password são obrigatórios')
    }

    console.log('🔐 Tentativa de login admin:', { username })

    // Buscar usuário admin
    const result = await query(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 AND role = $2',
      [username, 'super_admin']
    )

    if (result.rows.length === 0) {
      return ApiResponse.unauthorized('Credenciais inválidas')
    }

    const admin = result.rows[0]

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      return ApiResponse.unauthorized('Credenciais inválidas')
    }

    // Gerar JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token expira em 8 horas
    )

    console.log('✅ Login admin realizado com sucesso:', admin.username)

    // Retornar dados do admin e token (sem a senha)
    const { password_hash, ...adminData } = admin
    
    return ApiResponse.success({
      admin: adminData,
      token
    }, {
      message: 'Login realizado com sucesso!'
    })

  } catch (error: any) {
    console.error('Erro no login admin:', error)
    return ApiResponse.internalError('Erro interno no login')
  }
}

// GET - Verificar token admin
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized('Token não fornecido')
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Verificar se ainda é admin no banco
      const result = await query(
        'SELECT id, username, email, role FROM users WHERE id = $1 AND role = $2',
        [decoded.id, 'super_admin']
      )

      if (result.rows.length === 0) {
        return ApiResponse.unauthorized('Usuário não é mais admin')
      }

      return ApiResponse.success({
        admin: result.rows[0],
        valid: true
      })

    } catch (jwtError) {
      return ApiResponse.unauthorized('Token inválido')
    }

  } catch (error: any) {
    console.error('Erro na verificação do token:', error)
    return ApiResponse.internalError('Erro na verificação')
  }
}