import * as Sentry from '@sentry/nextjs'

export class ErrorReporter {
  /**
   * Reporta um erro para o Sentry com contexto adicional
   */
  static reportError(error: Error, context?: {
    user?: { id: string; email: string }
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: 'error' | 'warning' | 'info' | 'debug'
    fingerprint?: string[]
  }) {
    Sentry.withScope((scope) => {
      // Definir usuário se fornecido
      if (context?.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
        })
      }
      
      // Adicionar tags customizadas
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }
      
      // Adicionar dados extras
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value)
        })
      }
      
      // Definir nível do erro
      if (context?.level) {
        scope.setLevel(context.level)
      }
      
      // Definir fingerprint para agrupamento
      if (context?.fingerprint) {
        scope.setFingerprint(context.fingerprint)
      }
      
      // Capturar o erro
      Sentry.captureException(error)
    })
  }

  /**
   * Reporta um erro de API
   */
  static reportApiError(error: Error, request: {
    method: string
    url: string
    userId?: string
    userEmail?: string
  }) {
    this.reportError(error, {
      user: request.userId && request.userEmail ? {
        id: request.userId,
        email: request.userEmail,
      } : undefined,
      tags: {
        component: 'api',
        method: request.method,
        endpoint: request.url,
      },
      extra: {
        requestMethod: request.method,
        requestUrl: request.url,
      },
      fingerprint: [request.method, request.url, error.name],
    })
  }

  /**
   * Reporta um erro de banco de dados
   */
  static reportDatabaseError(error: Error, query: string, params?: any[]) {
    this.reportError(error, {
      tags: {
        component: 'database',
        operation: 'query',
      },
      extra: {
        query: query.substring(0, 200), // Limitar tamanho da query
        paramsCount: params?.length || 0,
      },
      level: 'error',
      fingerprint: ['database', error.name, query.split(' ')[0]], // Agrupar por tipo de operação SQL
    })
  }

  /**
   * Reporta um erro de autenticação
   */
  static reportAuthError(error: Error, operation: 'login' | 'register' | 'reset' | 'verify', userEmail?: string) {
    this.reportError(error, {
      user: userEmail ? { id: 'unknown', email: userEmail } : undefined,
      tags: {
        component: 'auth',
        operation,
      },
      extra: {
        authOperation: operation,
      },
      level: 'warning', // Auth errors são geralmente warnings, não erros críticos
      fingerprint: ['auth', operation, error.name],
    })
  }

  /**
   * Reporta um erro de email
   */
  static reportEmailError(error: Error, emailType: 'welcome' | 'reset' | 'test', recipient: string) {
    this.reportError(error, {
      tags: {
        component: 'email',
        emailType,
      },
      extra: {
        emailType,
        recipientDomain: recipient.split('@')[1], // Só o domínio por privacidade
      },
      level: 'warning',
      fingerprint: ['email', emailType, error.name],
    })
  }

  /**
   * Reporta um erro de cache/Redis
   */
  static reportCacheError(error: Error, operation: 'get' | 'set' | 'delete' | 'connect', key?: string) {
    this.reportError(error, {
      tags: {
        component: 'cache',
        operation,
      },
      extra: {
        cacheOperation: operation,
        keyPrefix: key?.split(':')[0], // Só o prefixo da chave
      },
      level: 'warning', // Cache errors são geralmente não críticos
      fingerprint: ['cache', operation, error.name],
    })
  }

  /**
   * Reporta métricas customizadas
   */
  static reportMetric(name: string, value: number, tags?: Record<string, string>) {
    Sentry.metrics.gauge(name, value, {
      tags,
    })
  }

  /**
   * Captura uma mensagem informativa
   */
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
  }) {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value)
        })
      }
      
      scope.setLevel(level)
      Sentry.captureMessage(message)
    })
  }

  /**
   * Inicia uma transação para monitoramento de performance
   */
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
      name,
      op,
    })
  }

  /**
   * Adiciona breadcrumb para debugging
   */
  static addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    })
  }
}