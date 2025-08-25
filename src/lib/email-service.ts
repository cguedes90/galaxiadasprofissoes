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
      
      // Log para desenvolvimento - na produção aqui seria integrado com serviço de email
      console.log('📧 EMAIL DE BOAS-VINDAS PREPARADO:')
      console.log('Para:', userData.email)
      console.log('Assunto: Bem-vindo à Galáxia das Profissões! 🌌')
      console.log('Conteúdo HTML gerado com sucesso')
      
      // TODO: Integrar com serviço de email (SendGrid, AWS SES, etc.)
      // Exemplo com SendGrid:
      /*
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      const msg = {
        to: userData.email,
        from: 'noreply@galaxiadasprofissoes.com',
        subject: 'Bem-vindo à Galáxia das Profissões! 🌌',
        html: htmlContent,
      }
      
      await sgMail.send(msg)
      */
      
      return true
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
      
      console.log('📧 EMAIL DE TESTE PREPARADO:')
      console.log('Para:', email)
      console.log('Conteúdo HTML gerado com sucesso')
      
      return true
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error)
      return false
    }
  }
}