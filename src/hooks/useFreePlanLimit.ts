'use client'

import { useState, useEffect } from 'react'

interface FreePlanLimitState {
  viewedProfessions: string[]
  remainingViews: number
  resetTime: Date | null
  isBlocked: boolean
}

const DAILY_LIMIT = 3
const RESET_HOURS = 24

export function useFreePlanLimit() {
  const [limitState, setLimitState] = useState<FreePlanLimitState>({
    viewedProfessions: [],
    remainingViews: DAILY_LIMIT,
    resetTime: null,
    isBlocked: false
  })

  const [showLimitModal, setShowLimitModal] = useState(false)

  // Chave para localStorage
  const STORAGE_KEY = 'freePlanLimit'

  // Carregar estado do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        const resetTime = parsed.resetTime ? new Date(parsed.resetTime) : null
        const now = new Date()

        // Verificar se deve resetar (passou 24h)
        if (resetTime && now >= resetTime) {
          // Resetar limites
          const newState: FreePlanLimitState = {
            viewedProfessions: [],
            remainingViews: DAILY_LIMIT,
            resetTime: null,
            isBlocked: false
          }
          setLimitState(newState)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
        } else {
          // Usar dados salvos
          setLimitState({
            ...parsed,
            resetTime
          })
        }
      } catch (error) {
        console.error('Erro ao carregar estado do plano gratuito:', error)
        resetToDefault()
      }
    }
  }, [])

  // Salvar estado no localStorage
  const saveState = (newState: FreePlanLimitState) => {
    setLimitState(newState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...newState,
      resetTime: newState.resetTime?.toISOString()
    }))
  }

  // Resetar para padrão
  const resetToDefault = () => {
    const defaultState: FreePlanLimitState = {
      viewedProfessions: [],
      remainingViews: DAILY_LIMIT,
      resetTime: null,
      isBlocked: false
    }
    saveState(defaultState)
  }

  // Verificar se pode visualizar uma profissão
  const canViewProfession = (professionName: string): boolean => {
    // Se já visualizou esta profissão hoje, pode ver novamente
    if (limitState.viewedProfessions.includes(professionName)) {
      return true
    }
    
    // Se ainda tem visualizações restantes
    return limitState.remainingViews > 0
  }

  // Marcar profissão como visualizada
  const markProfessionViewed = (professionName: string): boolean => {
    // Se já foi visualizada hoje, não contar novamente
    if (limitState.viewedProfessions.includes(professionName)) {
      return true
    }

    // Se não tem mais visualizações
    if (limitState.remainingViews <= 0) {
      setShowLimitModal(true)
      return false
    }

    // Contar uma visualização
    const newRemainingViews = limitState.remainingViews - 1
    const newViewedProfessions = [...limitState.viewedProfessions, professionName]
    
    // Se foi a última visualização, definir tempo de reset
    let resetTime = limitState.resetTime
    let isBlocked = false

    if (newRemainingViews === 0) {
      resetTime = new Date()
      resetTime.setHours(resetTime.getHours() + RESET_HOURS)
      isBlocked = true
      
      // Mostrar modal informativo após última visualização
      setTimeout(() => setShowLimitModal(true), 1000)
    }

    const newState: FreePlanLimitState = {
      viewedProfessions: newViewedProfessions,
      remainingViews: newRemainingViews,
      resetTime,
      isBlocked
    }

    saveState(newState)
    return true
  }

  // Calcular tempo restante para reset
  const getTimeUntilReset = (): string => {
    if (!limitState.resetTime) return ''
    
    const now = new Date()
    const diff = limitState.resetTime.getTime() - now.getTime()
    
    if (diff <= 0) return ''
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Verificar se ainda tem tempo para reset
  const hasActiveLimit = (): boolean => {
    if (!limitState.resetTime) return false
    return new Date() < limitState.resetTime
  }

  return {
    remainingViews: limitState.remainingViews,
    viewedProfessions: limitState.viewedProfessions,
    isBlocked: limitState.isBlocked && hasActiveLimit(),
    resetTime: limitState.resetTime,
    timeUntilReset: getTimeUntilReset(),
    showLimitModal,
    setShowLimitModal,
    canViewProfession,
    markProfessionViewed,
    hasActiveLimit,
    dailyLimit: DAILY_LIMIT
  }
}