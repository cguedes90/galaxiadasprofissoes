'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/components/AnalyticsProvider'

export function usePageTracking() {
  const pathname = usePathname()
  const analytics = useAnalytics()

  useEffect(() => {
    // Mapear rotas para nomes amigáveis
    const getPageName = (path: string): string => {
      const pageMap: Record<string, string> = {
        '/': 'Home',
        '/galaxy': 'Galaxy Explorer',
        '/test': 'Vocational Test',
        '/profile': 'User Profile',
        '/premium': 'Premium Upgrade',
        '/docs': 'API Documentation',
        '/login': 'Login',
        '/register': 'Register',
        '/forgot-password': 'Forgot Password',
        '/reset-password': 'Reset Password',
      }

      // Rotas dinâmicas
      if (path.startsWith('/profession/')) {
        return 'Profession Details'
      }
      if (path.startsWith('/test/results')) {
        return 'Test Results'
      }

      return pageMap[path] || 'Unknown Page'
    }

    const pageName = getPageName(pathname)
    
    // Rastrear visualização da página
    analytics.trackPageView(pageName, {
      page_name: pathname,
    })
  }, [pathname, analytics])
}

export default usePageTracking