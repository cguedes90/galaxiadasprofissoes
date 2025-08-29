import fs from 'fs'
import path from 'path'
import { RegisterData } from '@/types/user'

interface EmailData {
  userName: string
  userEmail: string
  userEducation: string
  registrationDate: string
  appUrl: string
}

export class EmailService {
  private static getEducationLabel(level: string): string {
    const educationMap: { [key: string]: string } = {
      'ensino_fundamental': 'Ensino Fundamental',
      'ensino_medio': 'Ensino Médio',
      'ensino_tecnico': 'Ensino Técnico',
      'ensino_superior': 'Ensino Superior',
      'pos_graduacao': 'Pós-graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    }
    return educationMap[level] || level
  }

  private static async getWelcomeEmailTemplate(data: EmailData): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'src', 'lib', 'email-templates', 'welcome-email.html')
      let template = fs.readFileSync(templatePath, 'utf8')
      
      // Replace placeholders with actual data
      template = template.replace(/\{\{userName\}\}/g, data.userName)
      template = template.replace(/\{\{userEmail\}\}/g, data.userEmail)
      template = template.replace(/\{\{userEducation\}\}/g, data.userEducation)
      template = template.replace(/\{\{registrationDate\}\}/g, data.registrationDate)
      template = template.replace(/\{\{appUrl\}\}/g, data.appUrl)
      
      return template
    } catch (error) {
      console.error('Erro ao carregar template de email:', error)
      return this.getFallbackWelcomeEmail(data)
    }
  }

  private static getFallbackWelcomeEmail(data: EmailData): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Galáxia das Profissões!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); color: white; text-align: center; padding: 30px; border-radius: 10px; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
        .highlight { color: #7c3aed; font-weight: bold; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌌 Bem-vindo à Galáxia das Profissões!</h1>
    </div>
    <div class="content">
        <p>Olá <span class="highlight">${data.userName}</span>!</p>
        <p>Que alegria ter você conosco! Sua jornada de descoberta profissional começa agora.</p>
        <p><strong>Dados do seu cadastro:</strong></p>
        <ul>
            <li>Nome: ${data.userName}</li>
            <li>Email: ${data.userEmail}</li>
            <li>Escolaridade: ${data.userEducation}</li>
            <li>Data de cadastro: ${data.registrationDate}</li>
        </ul>
        <a href="${data.appUrl}" class="button">🌟 Começar Minha Jornada</a>
    </div>
</body>
</html>`
  }

  public static async sendWelcomeEmail(userData: RegisterData, appUrl: string): Promise<boolean> {
    try {
      const emailData: EmailData = {
        userName: userData.name,
        userEmail: userData.email,
        userEducation: this.getEducationLabel(userData.education.level),
        registrationDate: new Date().toLocaleDateString('pt-BR'),
        appUrl: appUrl
      }

      const htmlContent = await this.getWelcomeEmailTemplate(emailData)
      
      // Integração com serviço de email real
      const emailSent = await this.sendEmail({
        to: userData.email,
        subject: 'Bem-vindo à Galáxia das Profissões! 🌌',
        html: htmlContent
      })

      if (emailSent) {
        console.log('✅ Email de boas-vindas enviado com sucesso para:', userData.email)
        return true
      } else {
        console.error('❌ Falha ao enviar email de boas-vindas')
        return false
      }
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error)
      return false
    }
  }

  public static async sendTestEmail(email: string, appUrl: string): Promise<boolean> {
    try {
      const testData: EmailData = {
        userName: 'Usuário Teste',
        userEmail: email,
        userEducation: 'Ensino Médio',
        registrationDate: new Date().toLocaleDateString('pt-BR'),
        appUrl: appUrl
      }

      const htmlContent = await this.getWelcomeEmailTemplate(testData)
      
      const emailSent = await this.sendEmail({
        to: email,
        subject: '🧪 Email de Teste - Galáxia das Profissões',
        html: htmlContent
      })

      if (emailSent) {
        console.log('✅ Email de teste enviado com sucesso para:', email)
        return true
      } else {
        console.error('❌ Falha ao enviar email de teste')
        return false
      }
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error)
      return false
    }
  }

  public static async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string, appUrl: string): Promise<boolean> {
    try {
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - Galáxia das Profissões</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); color: white; text-align: center; padding: 30px; border-radius: 10px; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
        .highlight { color: #7c3aed; font-weight: bold; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Redefinir Senha</h1>
        <p>Galáxia das Profissões</p>
    </div>
    <div class="content">
        <p>Olá <span class="highlight">${userName}</span>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        
        <a href="${resetUrl}" class="button">🔑 Redefinir Minha Senha</a>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Este link expira em 1 hora por segurança</li>
                <li>Se você não solicitou esta alteração, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
            </ul>
        </div>
        
        <p><small>Se o botão não funcionar, copie e cole este link no seu navegador:</small></p>
        <p><small style="word-break: break-all;">${resetUrl}</small></p>
    </div>
</body>
</html>`

      const emailSent = await this.sendEmail({
        to: userEmail,
        subject: '🔐 Redefinir Senha - Galáxia das Profissões',
        html: htmlContent
      })

      if (emailSent) {
        console.log('✅ Email de reset de senha enviado com sucesso para:', userEmail)
        return true
      } else {
        console.error('❌ Falha ao enviar email de reset de senha')
        return false
      }
    } catch (error) {
      console.error('Erro ao enviar email de reset de senha:', error)
      return false
    }
  }

  private static async sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid'
      
      switch (emailProvider.toLowerCase()) {
        case 'sendgrid':
          return await this.sendEmailWithSendGrid(options)
        case 'nodemailer':
          return await this.sendEmailWithNodemailer(options)
        default:
          console.warn('⚠️ Provedor de email não configurado, simulando envio')
          return await this.simulateEmailSend(options)
      }
    } catch (error) {
      console.error('Erro na função sendEmail:', error)
      return false
    }
  }

  private static async sendEmailWithSendGrid(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      const sgMail = require('@sendgrid/mail')
      const emailApiKey = process.env.SENDGRID_API_KEY
      const emailFrom = process.env.EMAIL_FROM
      
      if (!emailApiKey || !emailFrom) {
        console.error('❌ Configurações do SendGrid não encontradas no .env')
        return false
      }

      sgMail.setApiKey(emailApiKey)

      const msg = {
        to: options.to,
        from: emailFrom,
        subject: options.subject,
        html: options.html,
      }

      await sgMail.send(msg)
      console.log('✅ Email enviado com sucesso via SendGrid')
      return true
    } catch (error) {
      console.error('❌ Erro no envio via SendGrid:', error)
      return false
    }
  }

  private static async sendEmailWithNodemailer(options: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      const nodemailer = require('nodemailer')
      
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }

      await transporter.sendMail(mailOptions)
      console.log('✅ Email enviado com sucesso via Nodemailer')
      return true
    } catch (error) {
      console.error('❌ Erro no envio via Nodemailer:', error)
      return false
    }
  }

  private static async simulateEmailSend(options: { to: string; subject: string; html: string }): Promise<boolean> {
    console.log('📧 Simulando envio de email:')
    console.log('Para:', options.to)
    console.log('Assunto:', options.subject)
    console.log('✅ Email simulado como enviado com sucesso')
    return true
  }
}