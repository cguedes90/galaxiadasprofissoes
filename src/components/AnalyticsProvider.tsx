'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { analytics } from '@/lib/analytics'

interface AnalyticsContextType {
  analytics: typeof analytics
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Basic page view tracking
    if (typeof window !== 'undefined') {
      analytics.trackPageView(window.location.pathname)
    }
  }, [])

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