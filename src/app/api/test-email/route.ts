import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const appUrl = `${request.headers.get('origin') || 'http://localhost:3000'}`
    const success = await EmailService.sendTestEmail(email, appUrl)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email de teste preparado com sucesso! Verifique o console para ver o conteúdo.'
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao preparar email de teste' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro na API de teste de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}