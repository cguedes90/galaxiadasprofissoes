import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configurações de privacidade
  beforeSend(event) {
    // Filtrar informações sensíveis do servidor
    if (event.request) {
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
      }
    }
    
    // Filtrar dados de banco e variáveis de ambiente
    if (event.extra) {
      delete event.extra.DATABASE_URL
      delete event.extra.JWT_SECRET
      delete event.extra.EMAIL_API_KEY
      delete event.extra.password
      delete event.extra.token
    }
    
    return event
  },
  
  // Configurações do ambiente
  environment: process.env.NODE_ENV,
  
  // Ignorar erros conhecidos do servidor
  ignoreErrors: [
    // Erros de conexão de banco conhecidos
    'connection terminated',
    'Connection terminated unexpectedly',
    
    // Rate limiting
    'Too Many Requests',
    
    // Timeout errors
    'timeout',
    'ETIMEDOUT',
  ],
  
  // Tags padrão do servidor
  initialScope: {
    tags: {
      component: 'galaxia-profissoes-server',
      runtime: 'nodejs',
    },
  },
})