import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json({
        message: 'Se o email existir em nosso sistema, você receberá um link de redefinição de senha.',
        success: true
      })
    }

    const user = userResult.rows[0]

    // Gerar token de reset com expiração de 1 hora
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'password-reset'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Salvar o token no banco (opcional, para poder invalidar depois)
    await query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expires = $2 
       WHERE id = $3`,
      [resetToken, new Date(Date.now() + 60 * 60 * 1000), user.id] // 1 hora a partir de agora
    )

    // Enviar email de reset
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const emailSent = await EmailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
      appUrl
    )

    if (emailSent) {
      return NextResponse.json({
        message: 'Link de redefinição de senha enviado para seu email.',
        success: true
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao enviar email de redefinição. Tente novamente.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na solicitação de reset de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}