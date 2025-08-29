'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { analytics } from '@/lib/analytics'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsContextType {
  analytics: typeof analytics
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user } = useAuth()

  useEffect(() => {
    // Identificar usuário quando logado
    if (user?.isLoggedIn && user.id) {
      analytics.identify(user.id, {
        email: user.email,
        name: user.name,
        registrationDate: new Date().toISOString(),
        isPremium: false, // TODO: pegar do perfil do usuário
        totalProfessionsViewed: 0, // TODO: pegar do banco
        completedVocationalTest: false, // TODO: pegar do banco
      })
    }
  }, [user])

  useEffect(() => {
    // Resetar analytics no logout
    if (!user?.isLoggedIn) {
      analytics.reset()
    }
  }, [user?.isLoggedIn])

  return (
    <AnalyticsContext.Provider value={{ analytics }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics deve ser usado dentro de AnalyticsProvider')
  }
  return context.analytics
}