import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RegisterData } from '@/types/user'
import { EmailService } from '@/lib/email-service'
import { env } from '@/lib/env'
import { authRateLimit } from '@/lib/rate-limiter'

async function handlePOST(request: NextRequest) {
  try {
    const data: RegisterData = await request.json()
    
    // Validações básicas
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    if (data.password !== data.confirmPassword) {
      return NextResponse.json(
        { error: 'Senhas não conferem' },
        { status: 400 }
      )
    }

    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      )
    }

    if (!data.agreeTerms) {
      return NextResponse.json(
        { error: 'Você deve aceitar os termos de uso' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }
      )
    }

    // Hash da senha
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(data.password, saltRounds)

    // Criar usuário
    const userResult = await query(
      `INSERT INTO users (email, password_hash, name, created_at, last_login) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, email, name, created_at`,
      [data.email.toLowerCase(), passwordHash, data.name]
    )

    const newUser = userResult.rows[0]

    // Criar perfil do usuário
    await query(
      `INSERT INTO user_profiles (user_id, full_name, date_of_birth, country, created_at, updated_at)
       VALUES ($1, $2, $3, 'Brasil', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [newUser.id, data.name, data.dateOfBirth]
    )

    // Criar informações educacionais
    await query(
      `INSERT INTO education_info (user_id, current_level, status, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [newUser.id, data.education.level, data.education.status]
    )

    // Criar informações profissionais básicas
    await query(
      `INSERT INTO professional_info (user_id, status, created_at, updated_at)
       VALUES ($1, 'estudante', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [newUser.id]
    )

    // Criar preferências padrão
    await query(
      `INSERT INTO user_preferences (
        user_id, theme, language, 
        notifications, privacy, recommendation_filters,
        created_at, updated_at
      ) VALUES (
        $1, 'auto', 'pt-BR',
        '{"email": true, "push": false, "achievements": true, "journeys": true, "recommendations": true, "newsletter": false}',
        '{"profileVisibility": "public", "shareProgress": true, "shareAchievements": true, "allowRecommendations": true, "dataCollection": true}',
        '{"salaryRange": {"min": 1000, "max": 50000}, "workMode": ["remote", "hybrid", "presential"], "regions": ["Brasil"]}',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`,
      [newUser.id]
    )

    // Inicializar progresso de gamificação
    await query(
      `INSERT INTO user_progress (
        user_id, level, experience, professions_viewed, areas_explored, 
        tests_completed, achievements, created_at, last_active
      ) VALUES (
        $1, 1, 0, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 
        0, '[]'::JSONB, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`,
      [newUser.id]
    )

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Enviar email de boas-vindas
    try {
      const appUrl = `${request.headers.get('origin') || 'http://localhost:3000'}`
      await EmailService.sendWelcomeEmail(data, appUrl)
      console.log('✅ Email de boas-vindas enviado para:', data.email)
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de boas-vindas:', emailError)
      // Não falha o registro se o email não for enviado
    }

    // Resposta de sucesso (sem enviar a senha)
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso! Verifique seu email para começar.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.created_at,
        isLoggedIn: true
      },
      token
    })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = authRateLimit(handlePOST)