import { Achievement } from '@/types/gamification'

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Exploração
  {
    id: 'first_profession',
    title: 'Primeiro Passo',
    description: 'Visualize sua primeira profissão na galáxia',
    icon: '🌟',
    category: 'exploration',
    condition: {
      type: 'profession_viewed',
      target: 1
    },
    reward: {
      type: 'badge',
      value: 'Explorador Iniciante'
    },
    unlocked: false
  },
  {
    id: 'explorer',
    title: 'Explorador Curioso',
    description: 'Explore 10 profissões diferentes',
    icon: '🔍',
    category: 'exploration',
    condition: {
      type: 'profession_viewed',
      target: 10
    },
    reward: {
      type: 'title',
      value: 'Explorador Curioso'
    },
    unlocked: false
  },
  {
    id: 'galaxy_master',
    title: 'Mestre da Galáxia',
    description: 'Explore todas as profissões disponíveis',
    icon: '🌌',
    category: 'exploration',
    condition: {
      type: 'profession_viewed',
      target: 29
    },
    reward: {
      type: 'title',
      value: 'Mestre da Galáxia'
    },
    unlocked: false
  },
  {
    id: 'area_specialist',
    title: 'Especialista em Áreas',
    description: 'Explore profissões de 5 áreas diferentes',
    icon: '🎯',
    category: 'exploration',
    condition: {
      type: 'areas_explored',
      target: 5
    },
    reward: {
      type: 'badge',
      value: 'Especialista em Áreas'
    },
    unlocked: false
  },

  // Conhecimento
  {
    id: 'vocational_test',
    title: 'Autoconhecimento',
    description: 'Complete seu primeiro teste vocacional',
    icon: '🧠',
    category: 'knowledge',
    condition: {
      type: 'test_completed',
      target: 1
    },
    reward: {
      type: 'badge',
      value: 'Autoconhecedor'
    },
    unlocked: false
  },

  // Completude
  {
    id: 'first_favorite',
    title: 'Primeira Paixão',
    description: 'Adicione sua primeira profissão aos favoritos',
    icon: '💖',
    category: 'completion',
    condition: {
      type: 'favorites_count',
      target: 1
    },
    reward: {
      type: 'badge',
      value: 'Primeira Paixão'
    },
    unlocked: false
  },
  {
    id: 'favorites_collector',
    title: 'Colecionador de Favoritos',
    description: 'Adicione 5 profissões aos seus favoritos',
    icon: '⭐',
    category: 'completion',
    condition: {
      type: 'favorites_count',
      target: 5
    },
    reward: {
      type: 'badge',
      value: 'Colecionador de Favoritos'
    },
    unlocked: false
  },
  {
    id: 'favorites_master',
    title: 'Mestre dos Favoritos',
    description: 'Adicione 10 profissões aos seus favoritos',
    icon: '🌟',
    category: 'completion',
    condition: {
      type: 'favorites_count',
      target: 10
    },
    reward: {
      type: 'title',
      value: 'Mestre dos Favoritos'
    },
    unlocked: false
  },
  {
    id: 'wishlist_collector',
    title: 'Colecionador de Sonhos',
    description: 'Adicione 5 profissões à sua lista de desejos',
    icon: '⭐',
    category: 'completion',
    condition: {
      type: 'wishlist_size',
      target: 5
    },
    reward: {
      type: 'badge',
      value: 'Colecionador de Sonhos'
    },
    unlocked: false
  },

  // Social
  {
    id: 'social_explorer',
    title: 'Explorador Social',
    description: 'Compare 3 profissões diferentes',
    icon: '⚖️',
    category: 'social',
    condition: {
      type: 'profession_viewed', // Será customizado depois
      target: 3
    },
    reward: {
      type: 'title',
      value: 'Explorador Social'
    },
    unlocked: false
  }
]

// Funções de utilitários
export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return DEFAULT_ACHIEVEMENTS.filter(achievement => achievement.category === category)
}

export const calculateUserLevel = (experience: number): number => {
  // Cada nível requer mais experiência: 100, 250, 450, 700, 1000...
  const levels = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) {
      return i + 1
    }
  }
  
  return 1
}

export const getExperienceForNextLevel = (currentExp: number): number => {
  const levels = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]
  const currentLevel = calculateUserLevel(currentExp)
  
  if (currentLevel >= levels.length) {
    return 0 // Max level
  }
  
  return levels[currentLevel] - currentExp
}

export const checkAchievementUnlock = (
  achievement: Achievement,
  userProgress: { 
    professionsViewed: string[]
    areasExplored: string[]
    testsCompleted: number
    wishlistSize: number
    favoritesCount: number
  }
): boolean => {
  const { type, target } = achievement.condition
  
  switch (type) {
    case 'profession_viewed':
      return userProgress.professionsViewed.length >= target
    case 'areas_explored':
      return userProgress.areasExplored.length >= target
    case 'test_completed':
      return userProgress.testsCompleted >= target
    case 'wishlist_size':
      return userProgress.wishlistSize >= target
    case 'favorites_count':
      return userProgress.favoritesCount >= target
    default:
      return false
  }
}