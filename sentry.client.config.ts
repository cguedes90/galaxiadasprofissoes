import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configurações do cliente
  integrations: [
    Sentry.replayIntegration({
      // Capturar sessões com erro
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% das sessões
  replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
  
  // Configurações de privacidade
  beforeSend(event) {
    // Filtrar informações sensíveis
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    
    // Filtrar dados de formulários
    if (event.extra) {
      delete event.extra.password
      delete event.extra.confirmPassword
      delete event.extra.token
    }
    
    return event
  },
  
  // Configurações do ambiente
  environment: process.env.NODE_ENV,
  
  // Ignorar erros conhecidos
  ignoreErrors: [
    // Erros de rede comuns
    'NetworkError',
    'Network request failed',
    'fetch',
    
    // Erros de navegador/extensões
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Script error',
    
    // Erros específicos do Next.js
    'ChunkLoadError',
    'Loading chunk',
    'Loading CSS chunk',
  ],
  
  // Tags padrão
  initialScope: {
    tags: {
      component: 'galaxia-profissoes',
    },
  },
})