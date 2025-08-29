import mixpanel from 'mixpanel-browser'

// Tipos para eventos de analytics
export interface UserProperties {
  email: string
  name: string
  educationLevel: string
  registrationDate: string
  isPremium: boolean
  totalProfessionsViewed: number
  completedVocationalTest: boolean
}

export interface EventProperties {
  // Eventos de navegação
  page_name?: string
  section?: string
  
  // Eventos de profissão
  profession_id?: string
  profession_name?: string
  profession_area?: string
  view_count?: number
  
  // Eventos de teste vocacional
  test_score?: Record<string, number>
  dominant_traits?: string[]
  recommended_professions?: string[]
  
  // Eventos de busca
  search_query?: string
  filters_applied?: string[]
  results_count?: number
  
  // Eventos de conversão
  subscription_plan?: 'free' | 'premium'
  payment_method?: string
  amount?: number
  
  // Propriedades técnicas
  device_type?: 'mobile' | 'tablet' | 'desktop'
  browser?: string
  referrer?: string
  timestamp?: string
  user_id?: string
  
  // Propriedades de erro
  error_name?: string
  error_message?: string
  
  // Propriedades extras
  [key: string]: any
}

class AnalyticsService {
  private isInitialized = false
  private userId?: string

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
    
    if (!token) {
      console.warn('⚠️ Mixpanel token não configurado')
      return
    }

    try {
      mixpanel.init(token, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        property_blacklist: ['$current_url', '$initial_referrer', '$referrer'],
        ignore_dnt: false,
      })
      
      this.isInitialized = true
      console.log('✅ Mixpanel inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar Mixpanel:', error)
    }
  }

  /**
   * Identifica o usuário atual
   */
  identify(userId: string, properties?: Partial<UserProperties>) {
    if (!this.isInitialized) return

    this.userId = userId
    
    try {
      mixpanel.identify(userId)
      
      if (properties) {
        mixpanel.people.set(properties)
      }
    } catch (error) {
      console.error('❌ Erro ao identificar usuário:', error)
    }
  }

  /**
   * Atualiza propriedades do usuário
   */
  updateUserProperties(properties: Partial<UserProperties>) {
    if (!this.isInitialized) return

    try {
      mixpanel.people.set(properties)
    } catch (error) {
      console.error('❌ Erro ao atualizar propriedades do usuário:', error)
    }
  }

  /**
   * Rastreia um evento
   */
  track(eventName: string, properties?: EventProperties) {
    if (!this.isInitialized) return

    try {
      // Adicionar propriedades padrão
      const enrichedProperties: EventProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        user_id: this.userId,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        referrer: document.referrer || 'direct',
      }

      mixpanel.track(eventName, enrichedProperties)
    } catch (error) {
      console.error('❌ Erro ao rastrear evento:', error)
    }
  }

  /**
   * Rastreia visualização de página
   */
  trackPageView(pageName: string, properties?: EventProperties) {
    this.track('Page View', {
      page_name: pageName,
      ...properties,
    })
  }

  /**
   * Rastreia registro de usuário
   */
  trackUserRegistration(properties: {
    email: string
    name: string
    educationLevel: string
    registrationMethod: 'form' | 'social'
  }) {
    this.track('User Registered', {
      ...properties,
      section: 'auth',
    })
  }

  /**
   * Rastreia login de usuário
   */
  trackUserLogin(properties: {
    email: string
    loginMethod: 'form' | 'social' | 'remember_me'
  }) {
    this.track('User Login', {
      ...properties,
      section: 'auth',
    })
  }

  /**
   * Rastreia visualização de profissão
   */
  trackProfessionView(properties: {
    profession_id: string
    profession_name: string
    profession_area: string
    view_count: number
    is_premium_user: boolean
  }) {
    this.track('Profession Viewed', {
      ...properties,
      section: 'galaxy',
    })

    // Incrementar contador de profissões vistas
    try {
      mixpanel.people.increment('total_professions_viewed')
    } catch (error) {
      console.error('❌ Erro ao incrementar contador:', error)
    }
  }

  /**
   * Rastreia busca por profissões
   */
  trackSearch(properties: {
    search_query: string
    filters_applied: string[]
    results_count: number
  }) {
    this.track('Search Performed', {
      ...properties,
      section: 'search',
    })
  }

  /**
   * Rastreia início do teste vocacional
   */
  trackTestStarted() {
    this.track('Vocational Test Started', {
      section: 'test',
    })
  }

  /**
   * Rastreia conclusão do teste vocacional
   */
  trackTestCompleted(properties: {
    test_score: Record<string, number>
    dominant_traits: string[]
    recommended_professions: string[]
    completion_time_seconds: number
  }) {
    this.track('Vocational Test Completed', {
      ...properties,
      section: 'test',
    })

    // Marcar usuário como tendo completado o teste
    this.updateUserProperties({
      completedVocationalTest: true,
    })
  }

  /**
   * Rastreia upgrade para premium
   */
  trackPremiumUpgrade(properties: {
    subscription_plan: 'premium'
    payment_method: string
    amount: number
    trigger: 'limit_reached' | 'modal' | 'test_results' | 'other'
  }) {
    this.track('Premium Upgrade', {
      ...properties,
      section: 'conversion',
    })

    // Atualizar propriedades do usuário
    this.updateUserProperties({
      isPremium: true,
    })
  }

  /**
   * Rastreia limite de visualizações atingido
   */
  trackViewLimitReached(properties: {
    daily_views_used: number
    profession_attempted: string
  }) {
    this.track('View Limit Reached', {
      ...properties,
      section: 'freemium',
    })
  }

  /**
   * Rastreia interação com profissões relacionadas
   */
  trackRelatedProfessionClick(properties: {
    source_profession: string
    target_profession: string
  }) {
    this.track('Related Profession Clicked', {
      ...properties,
      section: 'galaxy',
    })
  }

  /**
   * Rastreia erros de usuário
   */
  trackError(errorName: string, properties?: {
    error_message?: string
    page_name?: string
    section?: string
  }) {
    this.track('Error Occurred', {
      error_name: errorName,
      ...properties,
    })
  }

  /**
   * Utilitários privados
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width <= 768) return 'mobile'
    if (width <= 1024) return 'tablet'
    return 'desktop'
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  /**
   * Reset para logout
   */
  reset() {
    if (!this.isInitialized) return

    try {
      mixpanel.reset()
      this.userId = undefined
    } catch (error) {
      console.error('❌ Erro ao resetar analytics:', error)
    }
  }
}

// Instância singleton
export const analytics = new AnalyticsService()
export default analytics