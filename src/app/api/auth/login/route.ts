import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { LoginCredentials } from '@/types/user'

const JWT_SECRET = process.env.JWT_SECRET || 'galaxia-secret-key'

export async function POST(request: Request) {
  try {
    const credentials: LoginCredentials = await request.json()
    
    // Validações básicas
    if (!credentials.email || !credentials.password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário no banco de dados
    const userResult = await query(
      `SELECT 
        u.id, u.email, u.password_hash, u.name, u.avatar, u.is_active,
        u.email_verified, u.created_at, u.last_login
       FROM users u 
       WHERE u.email = $1`,
      [credentials.email.toLowerCase()]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const user = userResult.rows[0]

    // Verificar se a conta está ativa
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Atualizar último login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    // Buscar dados do perfil
    const profileResult = await query(
      `SELECT 
        up.full_name, up.date_of_birth, up.avatar,
        ei.current_level, ei.status as education_status,
        pi.status as professional_status
       FROM user_profiles up
       LEFT JOIN education_info ei ON ei.user_id = up.user_id
       LEFT JOIN professional_info pi ON pi.user_id = up.user_id
       WHERE up.user_id = $1`,
      [user.id]
    )

    const profile = profileResult.rows[0] || {}

    // Buscar progresso de gamificação
    const progressResult = await query(
      `SELECT level, experience, professions_viewed, areas_explored, 
              tests_completed, achievements, created_at, last_active
       FROM user_progress 
       WHERE user_id = $1`,
      [user.id]
    )

    const progress = progressResult.rows[0] || null

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: credentials.rememberMe ? '30d' : '7d' }
    )

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || profile.avatar,
        isLoggedIn: true,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        profile: {
          fullName: profile.full_name || user.name,
          dateOfBirth: profile.date_of_birth,
          education: {
            currentLevel: profile.current_level,
            status: profile.education_status
          },
          professional: {
            status: profile.professional_status
          }
        }
      },
      progress,
      token
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}