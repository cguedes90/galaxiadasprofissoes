import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Simple registration API - no external dependencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, dateOfBirth, agreeTerms } = body

    // Basic validation
    if (!name || !email || !password || !confirmPassword || !dateOfBirth || !agreeTerms) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Todos os campos são obrigatórios' 
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email inválido' 
        },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Senha deve ter pelo menos 8 caracteres' 
        },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Senhas não conferem' 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Este email já está em uso' 
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, is_active, email_verified, created_at)
       VALUES ($1, $2, $3, true, false, CURRENT_TIMESTAMP)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), passwordHash, name.trim()]
    )

    const newUser = result.rows[0]

    // Create basic profile (optional - if table exists)
    try {
      await query(
        `INSERT INTO user_profiles (user_id, full_name, date_of_birth, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [newUser.id, name.trim(), dateOfBirth]
      )
    } catch (profileError) {
      console.warn('Could not create user profile:', profileError)
      // Continue without profile - not critical
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('User registered successfully:', { 
      userId: newUser.id, 
      email: newUser.email.replace(/(.{2}).*(@.*)/, '$1***$2')
    })

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.created_at
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Return generic error for security
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    )
  }
}