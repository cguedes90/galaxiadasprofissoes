import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/database'
import bcrypt from 'bcryptjs'
import { generateToken, createAuthResponse } from '@/lib/auth'
import { log } from '@/lib/logger-safe'
import { RegisterData } from '@/types/user'

// Improved registration API with better validation and user experience
export async function POST(request: NextRequest) {
  let userEmail = 'unknown'
  try {
    const body: RegisterData = await request.json()
    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      dateOfBirth, 
      education,
      agreeTerms, 
      agreeNewsletter = false 
    } = body
    
    userEmail = email || 'unknown'

    // Enhanced validation
    const validationErrors = validateRegistrationData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: validationErrors[0], // Mostrar primeira validação
          validationErrors // Array completo para debugging
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existingUser.rows.length > 0) {
      log.authFailure(email, 'email_already_exists')
      return NextResponse.json(
        { 
          success: false,
          error: 'Este email já está cadastrado. Tente fazer login ou usar "Esqueci minha senha".',
          field: 'email'
        },
        { status: 409 }
      )
    }

    // Create user with complete profile in transaction
    const userData = await withTransaction(async (client) => {
      // Hash password with strong salt
      const passwordHash = await bcrypt.hash(password, 14)

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, name, is_active, email_verified, created_at, last_login
        ) VALUES ($1, $2, $3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, name, created_at, last_login`,
        [email.toLowerCase().trim(), passwordHash, name.trim()]
      )

      const newUser = userResult.rows[0]

      // Create user profile
      await client.query(
        `INSERT INTO user_profiles (
          user_id, full_name, date_of_birth, country, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [newUser.id, name.trim(), dateOfBirth, 'Brasil']
      )

      // Create education info
      if (education?.level && education?.status) {
        await client.query(
          `INSERT INTO education_info (
            user_id, current_level, status, created_at, updated_at
          ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [newUser.id, education.level, education.status]
        )
      }

      // Create default user preferences
      const notificationsJson = {
        email: true,
        push: false,
        achievements: true,
        journeys: true,
        recommendations: true,
        newsletter: agreeNewsletter || false
      }
      
      const privacyJson = {
        profileVisibility: 'public',
        shareProgress: true,
        shareAchievements: true,
        allowRecommendations: true,
        dataCollection: true
      }
      
      const recommendationFiltersJson = {
        salaryRange: { min: 1000, max: 50000 },
        workMode: ['remote', 'hybrid', 'presential'],
        regions: ['Brasil']
      }
      
      await client.query(
        `INSERT INTO user_preferences (
          user_id, theme, language, notifications, privacy, recommendation_filters, created_at, updated_at
        ) VALUES (
          $1, 'auto', 'pt-BR', $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
        [
          newUser.id, 
          JSON.stringify(notificationsJson),
          JSON.stringify(privacyJson),
          JSON.stringify(recommendationFiltersJson)
        ]
      )

      // Initialize user progress for gamification (try-catch for optional features)
      try {
        await client.query(
          `INSERT INTO user_progress (
            user_id, level, experience, achievements, created_at, last_active
          ) VALUES (
            $1, 1, 0, '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )`,
          [newUser.id]
        )
      } catch (progressError) {
        // Gamification is optional, don't fail registration if this fails
        console.warn('Could not initialize user progress:', progressError)
      }

      return newUser
    })

    // Generate JWT token
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
      name: userData.name
    }, '30d') // Token de longa duração para melhor UX

    // Log successful registration
    log.info(`Usuário registrado com sucesso: ${userData.id}`, {
      userId: userData.id,
      email: userData.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      hasEducation: !!education?.level,
      agreeNewsletter
    })

    // Preparar dados do usuário para resposta
    const responseUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      isLoggedIn: true,
      emailVerified: false,
      createdAt: userData.created_at,
      lastLogin: userData.last_login,
      profile: {
        fullName: userData.name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        education: education || null
      },
      progress: {
        level: 1,
        experience: 0,
        professions_viewed: 0,
        areas_explored: 0,
        tests_completed: 0,
        achievements: []
      }
    }

    return createAuthResponse(responseUser, token)

  } catch (error) {
    log.error('Erro no registro de usuário', error, {
      userEmail: userEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
      timestamp: new Date().toISOString()
    })
    
    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Este email já está em uso',
            field: 'email'
          },
          { status: 409 }
        )
      }
      
      if (error.message.includes('invalid input syntax')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Dados inválidos fornecidos',
            field: 'dateOfBirth'
          },
          { status: 400 }
        )
      }
    }
    
    // Return generic error for security
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor. Tente novamente em alguns momentos.' 
      },
      { status: 500 }
    )
  }
}

// Enhanced validation function
function validateRegistrationData(data: RegisterData): string[] {
  const errors: string[] = []
  
  // Required fields
  if (!data.name?.trim()) errors.push('Nome é obrigatório')
  if (!data.email?.trim()) errors.push('Email é obrigatório')
  if (!data.password) errors.push('Senha é obrigatória')
  if (!data.confirmPassword) errors.push('Confirmação de senha é obrigatória')
  if (!data.dateOfBirth) errors.push('Data de nascimento é obrigatória')
  if (!data.agreeTerms) errors.push('Você deve aceitar os termos de uso')
  
  // Name validation
  if (data.name && (data.name.trim().length < 2 || data.name.trim().length > 100)) {
    errors.push('Nome deve ter entre 2 e 100 caracteres')
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (data.email && !emailRegex.test(data.email.trim())) {
    errors.push('Email deve ter um formato válido')
  }
  
  // Password validation
  if (data.password && data.password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }
  
  if (data.password && data.password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)')
  }
  
  // Password strength validation
  if (data.password) {
    const hasLowerCase = /[a-z]/.test(data.password)
    const hasUpperCase = /[A-Z]/.test(data.password)
    const hasNumbers = /\d/.test(data.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password)
    
    const strengthCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    
    if (strengthCount < 2) {
      errors.push('Senha deve conter pelo menos 2 tipos: minúsculas, maiúsculas, números ou símbolos')
    }
  }
  
  // Password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push('Senhas não conferem')
  }
  
  // Date of birth validation
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    if (age < 13) {
      errors.push('Você deve ter pelo menos 13 anos para se cadastrar')
    }
    
    if (age > 120) {
      errors.push('Data de nascimento inválida')
    }
    
    if (birthDate > today) {
      errors.push('Data de nascimento não pode ser no futuro')
    }
  }
  
  // Education validation (if provided)
  if (data.education) {
    const validLevels = [
      'ensino_fundamental', 'ensino_medio', 'ensino_tecnico', 
      'ensino_superior', 'pos_graduacao', 'mestrado', 'doutorado'
    ]
    const validStatuses = ['estudando', 'concluido', 'interrompido', 'pretendo_cursar']
    
    if (data.education.level && !validLevels.includes(data.education.level)) {
      errors.push('Nível de educação inválido')
    }
    
    if (data.education.status && !validStatuses.includes(data.education.status)) {
      errors.push('Status de educação inválido')
    }
  }
  
  return errors
}