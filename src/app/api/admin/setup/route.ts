import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

// POST - Criar usuário super admin (roda apenas uma vez)
export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json()

    if (!username || !password || !email) {
      return ApiResponse.validationError('Username, password e email são obrigatórios')
    }

    console.log('🔐 Criando usuário super admin...')

    // Primeiro, garantir que a coluna role existe na tabela users
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`)
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)`)
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`)
      console.log('✅ Colunas verificadas/criadas na tabela users')
    } catch (alterError) {
      console.log('⚠️ Erro ao alterar tabela (pode ser normal):', alterError)
    }

    // Verificar se já existe um super admin
    const existingAdmin = await query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['super_admin']
    )

    if (existingAdmin.rows.length > 0) {
      return ApiResponse.conflict('Já existe um usuário super admin no sistema')
    }

    // Hash da senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar o usuário super admin
    const result = await query(`
      INSERT INTO users 
      (username, email, password_hash, role, created_at, is_active, name)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, true, $5)
      RETURNING id, username, email, role, created_at, name
    `, [username, email, hashedPassword, 'super_admin', username])

    const admin = result.rows[0]

    console.log('✅ Super admin criado:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    })

    return ApiResponse.success(admin, {
      message: 'Usuário super admin criado com sucesso!'
    })

  } catch (error: any) {
    console.error('Erro ao criar super admin:', error)
    
    if (error.code === '23505') { // Unique violation
      return ApiResponse.conflict('Username ou email já existem')
    }
    
    return ApiResponse.internalError('Falha ao criar usuário super admin', error.message)
  }
}

// GET - Verificar se existe super admin
export async function GET() {
  try {
    const adminExists = await query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['super_admin']
    )

    const hasAdmin = parseInt(adminExists.rows[0].count) > 0

    return ApiResponse.success({ hasAdmin })

  } catch (error) {
    console.error('Erro ao verificar admin:', error)
    return ApiResponse.internalError('Erro ao verificar admin')
  }
}