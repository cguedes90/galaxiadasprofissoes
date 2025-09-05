import { useState, useEffect, useCallback } from 'react'
import { UserProgress, Achievement } from '@/types/gamification'
import { DEFAULT_ACHIEVEMENTS, checkAchievementUnlock } from '@/data/achievements'

const STORAGE_KEY = 'galaxia_user_progress'

export const useGamification = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  // Carregar progresso do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Converter datas de string para Date
        parsed.createdAt = new Date(parsed.createdAt)
        parsed.lastActive = new Date(parsed.lastActive)
        parsed.achievements = parsed.achievements.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
        }))
        setUserProgress(parsed)
      } catch (error) {
        console.error('Erro ao carregar progresso:', error)
        initializeProgress()
      }
    } else {
      initializeProgress()
    }
  }, [])

  // Salvar progresso no localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    setUserProgress(progress)
  }, [])

  // Inicializar progresso
  const initializeProgress = useCallback(() => {
    const newProgress: UserProgress = {
      userId: 'local_user',
      level: 1,
      experience: 0,
      professionsViewed: [],
      areasExplored: [],
      testsCompleted: 0,
      achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
      createdAt: new Date(),
      lastActive: new Date()
    }
    saveProgress(newProgress)
  }, [saveProgress])

  // Adicionar experiência
  const addExperience = useCallback((amount: number, reason?: string) => {
    if (!userProgress) return

    const updatedProgress = {
      ...userProgress,
      experience: userProgress.experience + amount,
      lastActive: new Date()
    }
    
    console.log(`+${amount} XP${reason ? ` - ${reason}` : ''}`)
    saveProgress(updatedProgress)
  }, [userProgress, saveProgress])

  // Registrar visualização de profissão
  const trackProfessionViewed = useCallback((professionName: string) => {
    if (!userProgress) return

    const alreadyViewed = userProgress.professionsViewed.includes(professionName)
    if (alreadyViewed) return

    const updatedProgress = {
      ...userProgress,
      professionsViewed: [...userProgress.professionsViewed, professionName],
      lastActive: new Date()
    }

    // Adicionar experiência pela primeira visualização
    updatedProgress.experience += 25

    // Verificar conquistas
    checkAndUnlockAchievements(updatedProgress)
    
    saveProgress(updatedProgress)
    console.log(`Profissão explorada: ${professionName} (+25 XP)`)
  }, [userProgress, saveProgress])

  // Registrar área explorada
  const trackAreaExplored = useCallback((areaName: string) => {
    if (!userProgress) return

    const alreadyExplored = userProgress.areasExplored.includes(areaName)
    if (alreadyExplored) return

    const updatedProgress = {
      ...userProgress,
      areasExplored: [...userProgress.areasExplored, areaName],
      experience: userProgress.experience + 50,
      lastActive: new Date()
    }

    checkAndUnlockAchievements(updatedProgress)
    saveProgress(updatedProgress)
    console.log(`Nova área explorada: ${areaName} (+50 XP)`)
  }, [userProgress, saveProgress])

  // Registrar teste completado
  const trackTestCompleted = useCallback(() => {
    if (!userProgress) return

    const updatedProgress = {
      ...userProgress,
      testsCompleted: userProgress.testsCompleted + 1,
      experience: userProgress.experience + 200,
      lastActive: new Date()
    }

    checkAndUnlockAchievements(updatedProgress)
    saveProgress(updatedProgress)
    console.log('Teste vocacional completado! (+200 XP)')
  }, [userProgress, saveProgress])

  // Verificar e desbloquear conquistas
  const checkAndUnlockAchievements = useCallback((progress: UserProgress) => {
    const unlockedThisSession: Achievement[] = []

    const updatedAchievements = progress.achievements.map(achievement => {
      if (achievement.unlocked) return achievement

      const shouldUnlock = checkAchievementUnlock(achievement, {
        professionsViewed: progress.professionsViewed,
        areasExplored: progress.areasExplored,
        testsCompleted: progress.testsCompleted,
        wishlistSize: 0, // TODO: implementar wishlist
        favoritesCount: 0 // TODO: implementar contagem de favoritos
      })

      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        }
        unlockedThisSession.push(unlockedAchievement)
        
        // Experiência bonus por conquista
        progress.experience += 100
        
        return unlockedAchievement
      }

      return achievement
    })

    progress.achievements = updatedAchievements

    if (unlockedThisSession.length > 0) {
      setNewAchievements(unlockedThisSession)
      console.log(`🏆 ${unlockedThisSession.length} nova(s) conquista(s) desbloqueada(s)!`)
    }
  }, [])

  // Limpar notificações de conquistas
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([])
  }, [])

  // Reset do progresso (para desenvolvimento)
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    initializeProgress()
  }, [initializeProgress])

  return {
    userProgress,
    newAchievements,
    addExperience,
    trackProfessionViewed,
    trackAreaExplored,
    trackTestCompleted,
    clearNewAchievements,
    resetProgress
  }
}