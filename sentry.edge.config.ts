import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configurações do ambiente
  environment: process.env.NODE_ENV,
  
  // Tags padrão do edge runtime
  initialScope: {
    tags: {
      component: 'galaxia-profissoes-edge',
      runtime: 'edge',
    },
  },
})