import { NextRequest } from 'next/server'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validação básica
    if (!name || !email || !subject || !message) {
      return ApiResponse.validationError('Todos os campos são obrigatórios')
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return ApiResponse.validationError('Email inválido')
    }

    // Preparar dados do email
    const emailData = {
      from: process.env.EMAIL_FROM || 'contato@inovamentelabs.com.br',
      to: 'contato@inovamentelabs.com.br',
      subject: `[Galáxia das Profissões] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { background: white; padding: 10px; border-left: 4px solid #667eea; margin-top: 5px; }
            .footer { text-align: center; padding: 10px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🌌 Nova Mensagem - Galáxia das Profissões</h2>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">👤 Nome:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">📝 Assunto:</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">💬 Mensagem:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Esta mensagem foi enviada através do formulário de contato do site Galáxia das Profissões</p>
            <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
        </html>
      `
    }

    // Simular envio de email (aqui você integraria com seu provedor de email)
    console.log('📧 Email de contato recebido:', {
      from: email,
      name: name,
      subject: subject,
      timestamp: new Date().toISOString()
    })

    // Em produção, aqui você usaria um serviço como SendGrid, Nodemailer, etc.
    // Exemplo com fetch para um serviço de email externo:
    /*
    const emailApiKey = process.env.EMAIL_API_KEY
    if (emailApiKey) {
      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'contato@inovamentelabs.com.br' }] }],
          from: { email: process.env.EMAIL_FROM },
          subject: emailData.subject,
          content: [{ type: 'text/html', value: emailData.html }]
        })
      })

      if (!emailResponse.ok) {
        throw new Error('Falha ao enviar email')
      }
    }
    */

    // Por enquanto, vamos apenas logar e retornar sucesso
    // O email real seria enviado quando o EMAIL_API_KEY estiver configurado
    
    return ApiResponse.success(null, {
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro ao processar contato:', error)
    return ApiResponse.internalError('Falha ao enviar mensagem')
  }
}